import { Client, Guild, MessageEmbed, TextBasedChannels } from "discord.js"
import { readFile, writeFile } from "fs/promises"
import { resolve } from "path"
import { exit } from "process"
import { asleep, gembed, rand } from "./tools"




type userDataT = {
    wrong: number;
    right: number;
    streak: number;
    streakP: number;
    costs: number
    duel: number;
    duels: {
        rightQ: number,
        wrongQ: number,
        won: number,
        lost: number,
        streak: number
    }
    scores: { 
        streak: number,
        duelStreak: number
    };
    prestige: number,
}

class userMgr {
    public cache:Record<string, userDataT>
    public inited: boolean
    public location: string
    public safeGuardW: boolean
    constructor() {
        this.cache = {}
        this.location = resolve(`./${process.env.USER_DATA || 'userData.json'}`)
        this.safeGuardW = false
    }
    async init():Promise<void> {
        try {
            if ((await readFile(this.location, {encoding: 'utf-8'}))[0] != '{') {
                await writeFile(this.location, JSON.stringify(this.cache), {encoding: 'utf-8'})
            } else {
                this.cache = (await import(this.location)).default ?? {}
            }        
        } catch {
            await writeFile(this.location, JSON.stringify(this.cache), {encoding: 'utf-8'})
        }
        this.inited = true
    }
    
    async writeData():Promise<void> {
        if (this.safeGuardW || !this.inited) return
        this.safeGuardW = true
        console.log(JSON.stringify(this.cache))
        await writeFile(this.location, JSON.stringify(this.cache) ?? {})
        this.safeGuardW = false
    }

    private makeData(prestige = 0, streak = 0):userDataT {
        return {
            streakP: 0,
            prestige,
            right: 0,
            duel: 0,
            costs: 0,
            duels: {
                lost: 0,
                rightQ: 0,
                won: 0,
                wrongQ: 0,
                streak: 0
            },
            scores: {
                duelStreak: 0,
                streak: 0
            },
            streak,
            wrong: 0
        }
    }
    
    pointCalc = (user:string):number => parseFloat(((this.cache[user].streakP + this.cache[user].right - this.cache[user].wrong + this.cache[user].duel)*this.multiplyCalc(this.cache[user].prestige)  - this.cache[user].costs).toFixed(1))
    multiplyCalc = (prestige:number):number => prestige == 0 ? 1 : (1 + 0.3*(2**prestige))
    steakPointCalc = (steak:number):number => parseFloat((steak >= 10 ? ((steak - 4 - (steak-10)/5) / 5)
                                             : steak >= 3 ? (steak - 2)/10 
                                             : 0).toFixed(1))


        
    async answerQuestion(user:string, correct: "yes" | "no" | "skip"):Promise<userDataT> {
        if (!Object.keys(this.cache).includes(user)) {
            this.cache[user] = this.makeData()
        }
        if (correct == "yes") {
            this.cache[user].right++
            this.cache[user].streak++
            this.cache[user].streakP = this.steakPointCalc(this.cache[user].streak)
            if (this.cache[user].scores.streak > this.cache[user].streak) this.cache[user].scores.streak = this.cache[user].streak
        } else if (correct == "no") {
            this.cache[user].wrong++
            this.cache[user].streak = 0
        } else {
            this.cache[user].costs -= this.steakPointCalc(this.cache[user].streak -1)
        }
        await this.writeData()
        return this.cache[user]
    }

    async prestige(userId:string):Promise<MessageEmbed> {
        if (200*2**this.cache[userId].prestige < this.pointCalc(userId)) {
            this.cache[userId] = this.makeData(this.cache[userId].prestige + 1, this.cache[userId].streak)
            await this.writeData()
        } else throw 2
        return gembed(`Your new multiplier is ${this.multiplyCalc(this.cache[userId].prestige).toString()}!`)
    }

    stats(user:string):MessageEmbed {
        if (!Object.keys(this.cache).includes(user)) {            console.log("Wtf man 2")
            throw 7;
        }
        const {right, wrong, duels, streak, streakP, scores, prestige, duel} = this.cache[user]
        return gembed(
            '',
            `Your Stats - (${this.pointCalc(user)})`,
            undefined,
            [
                { name: "Right",              value: right.toString(),                             inline: true },
                { name: "Wrong",              value: wrong.toString(),                             inline: true },
                { name: "'Pure' Points",      value: (right - wrong).toString(),                   inline: true },
                { name: "Duel Right",         value: duels.rightQ.toString(),                      inline: true },
                { name: "Duel Wrong",         value: duels.wrongQ.toString(),                      inline: true },
                { name: "Duel Points",        value: duel.toString(),                              inline: true },
                { name: "Current streak",     value: streak.toString(),                            inline: true },
                { name: "Highest streak",     value: scores.streak.toString(),                     inline: true },
                { name: "Steak points",       value: streakP.toString(),                           inline: true },
                { name: "Duels Won",          value: duels.won.toString(),                         inline: true },
                { name: "Duels Lost",         value: duels.lost.toString(),                        inline: true },
                { name: "Duel Win Steak",     value: duels.streak.toString(),                      inline: true },
                { name: "Times Prestiged",    value: prestige.toString(),                          inline: true },
                { name: "Prestige Multiplier",value: this.multiplyCalc(prestige).toString(),       inline: true } 
            ]
        )
    }
    leaderboard(userId: string): MessageEmbed {
        let points:[number, string][] = [];
        for (const author in this.cache[userId]) {
            points.push([this.pointCalc(author), author]);
        }
        points = points.sort((a, b) => b[0] - a[0]);
        let mesg = "";
        if (this.cache[userId]) {
            let curIndex = 0;
            for (const point of points) {
                if (point[1] == userId) break;
                curIndex++;
            }
            if (curIndex == 0) {
                mesg = "Dam! Number 1, youre mr coolman!";
            } else if (curIndex <= 3) {
                mesg = "Top 3, pretty cool!" + ` (${curIndex + 1})`;
            } else if (curIndex <= 7) {
                mesg = "Top 7, not bad" + ` (${curIndex + 1})`;
            } else {
                mesg = "You're.. umm well.. not as good as I though you'd be...";
            }
        } else {
            mesg = "You don't have any data saved!";
        }
        let gay = "";
        for (const num of [0, 1, 2, 3, 4, 5, 6]) {
            if (!points[num]) continue;
            gay += `#${num + 1}\t\t<@${points[num][1]}>\t\t${points[num][0]}\n`;
        }
        return gembed(`${mesg}\n${gay}`, `Leaderboards!`, `#5655b0`);
    }
    async createByDefault(id:string):Promise<void> {
        if (Object.keys(this.cache).includes(id)) return
        else {
            this.cache[id] = this.makeData(0, 0)
            await this.writeData()
        }
    }
}

type Message = {
    author: string,
    content: string,
    timesent: string
}

type Messages = {
    authors: string[],
    last: number,
    msgs: Record<string, Message>   
}

type question = {
    mode: "notguess" | "guess";
    opt: Record<'1' | '2' | '3' | '4', string>
    msgId: string;
    correct: string;
    date: number | Date;
}

type duelBase = {
    requester: string,
    opponent: string,
    bid: number,
}

type duelData = {
    occupiedUsers: string[]
    requests: Record<string, ({ timeSent: number } & duelBase)[]>
    info: Record<string, { 
        channel: string,
        game: {
            question: question,
            qNum: number,
            requester: number,
            opponent: number,
            failed: "requester" | "opponent" | ""
            map: {
                [key:string]: "requester" | "opponent"
            }
        }
    } & duelBase>
}

class DuelMgr {
    /** requester id: */
    public cache:duelData
    public location:string
    public inited:boolean
    public safeGuardW:boolean

    constructor() {
        this.inited = false
        this.safeGuardW = false
        this.cache = {
            occupiedUsers: [],
            info: {},
            requests: {}
        }
        this.location = resolve(`./${process.env.DUEL_DATA ?? 'duels.json'}`)
    }

    async init():Promise<void> {
        try {
            if ((await readFile(this.location, {encoding: 'utf-8'}))[0] != '{') {
                await writeFile(this.location, JSON.stringify(this.cache), {encoding: 'utf-8'})
            } else {
                this.cache = (await import(this.location)).default
            }
        } catch {
            await writeFile(this.location, JSON.stringify(this.cache), {encoding: 'utf-8'})
        }
        this.inited = true
    }

    async writeData():Promise<void> {
        if (this.safeGuardW || !this.inited) return 
        this.safeGuardW = true
        await writeFile(this.location, JSON.stringify(this.cache))
        this.safeGuardW = false
    }
}

export class questionMgr {
    /** channel id : question */
    public cache:Record<string, question>
    public msgs:Messages
    public inited: boolean
    public location: string
    public location2: string
    public safeGuardW: boolean
    public user:userMgr
    public duels:DuelMgr
    public client:Client
    constructor(client:Client) {
        this.cache = {}
        this.user = new userMgr()
        this.duels = new DuelMgr()
        this.msgs = {last: 0, authors: [], msgs: {}}
        this.location = resolve(`./${process.env.QUESTION_DATA || 'qData.json'}`)
        this.location2 = resolve(`./${process.env.MSG_DATA || 'msgs.json'}`)
        this.safeGuardW = false        
        this.client = client
    }

    async init():Promise<void> {
        try {
            if ((await readFile(this.location, {encoding: 'utf-8'}))[0] != '{') {
                await writeFile(this.location, JSON.stringify(this.cache), {encoding: 'utf-8'})
            } else {
                this.cache = (await import(this.location)).default
            }
        } catch {
            await writeFile(this.location, JSON.stringify(this.cache), {encoding: 'utf-8'})
        }
        let bad = ''
        if ((await readFile(this.location2, {encoding: 'utf-8'}))[0] != '{') {
            bad = `${this.location2} doesn't have message data!`
        } else {
            this.msgs = await import(this.location2)
            if (this.msgs.authors?.length == 0 || this.msgs?.last == 0) {
                bad = `The message data is bad! It doesn't have authors/last data!`
            }
        }
        if (bad) {
            console.error(bad)
            exit(2)
        }
        await this.user.init()
        await this.duels.init()
        const { PARENT_ID } = process.env
        if (!PARENT_ID) throw 'd5'
        console.log('Inited :D')
        this.inited = true
    }
    
    async writeData():Promise<void> {
        if (this.safeGuardW || !this.inited) return
        this.safeGuardW = true
        await writeFile(this.location, JSON.stringify(this.cache))
        this.safeGuardW = false
    }

    makeQuestion():question {
        const msgId = rand(0, this.msgs.last).toString()
        const correct = rand(1, 4).toString()
        const opt:question['opt'] = {1: '', 2: '3', 4: '5', 3: '4'}
        const ppl:string[] = [];
        const getPerson = (pl: string[], cor: string):string => {
            let testPerson = this.msgs.authors[rand(0, this.msgs.authors.length - 1)];
            if (pl.includes(testPerson) || testPerson == cor) testPerson = getPerson(pl, cor);
            return testPerson;
        }
        ['1', '2', '3', '4'].forEach(num => {
            opt[num] = getPerson(ppl, this.msgs.msgs[msgId].author)
            ppl.push(opt[num])
        });
        opt[correct] = this.msgs.msgs[msgId].author

        return {
            opt,
            correct,
            msgId,
            mode: "guess",
            date: new Date(Date.now() + 30000)
        }
    }
    
    async writeAllData():Promise<void> {
        await this.user.writeData()
        await this.duels.writeData()
        await this.writeData()
    }

    private async newQ(chan:string):Promise<question> {
        if (Object.keys(this.cache).includes(chan)) if (this.cache[chan].mode == "guess" && !(this.cache[chan].date < Date.now())) throw 1
        this.cache[chan] = this.makeQuestion()
        await this.writeData()
        return this.cache[chan]
    }

    async comNew(chan:string):Promise<MessageEmbed> {
        await this.newQ(chan)
        return this.questionEmb(this.cache[chan])
    }

    async s(chan:string, user:string):Promise<MessageEmbed> {
        const part1 = `The right answer is \`${this.msgs.msgs[this.cache[chan].msgId].content}\` by <@${this.msgs.msgs[this.cache[chan].msgId].author}> on ${this.msgs.msgs[this.cache[chan].msgId].timesent}`
        if (Object.keys(this.cache).includes(chan)) {
            if (this.cache[chan].mode == "guess" && !(this.cache[chan].date < Date.now())) await this.user.answerQuestion(user, 'skip')
        } else {
            throw 5
        }
        await this.reset(chan)
        await this.writeData()

        return gembed(`This has been skipped. Your streak is ${this.user.cache[user].streak}, your score is ${this.user.pointCalc(user)}\n${part1}`)
    }

    async reset(chan:string):Promise<question> {
        this.cache[chan] = {
            correct: '',
            date: 999999,
            mode: "notguess",
            msgId: '0',
            opt: {1:'',2:'',3:'',4:''}
        }
        await this.writeData()
        return this.cache[chan]
    }

    questionEmb({msgId, opt}:question):MessageEmbed {
        return gembed(
            `Who said this?\n\`${this.msgs.msgs[msgId].content}\`\n${Object.keys(opt).map((val) => `${val}:\t<@${opt[val]}>\n`).join('')}Remember: You have 30 seconds\n\n\n\n\n\n\n\n\n\n\n\n:D`,
        )
    }

    async duelGuess(chanID:string, userID: string, value: string):Promise<MessageEmbed[]> {
        const emb:MessageEmbed[] = []
        let newQ = true
        if (!['1', '2', '3', '4'].includes(value)) throw 4
        if (this.duels.cache.info[chanID].game.question.correct == value) {
            this.duels.cache.info[chanID].game[this.duels.cache.info[chanID].game.map[userID]]++
            emb.push(gembed(
                `Yessir you got it right!\n\`${this.msgs.msgs[this.duels.cache.info[chanID].game.question.msgId].content}\` is said by <@${this.msgs.msgs[this.duels.cache.info[chanID].game.question.msgId].author}> on ${this.msgs.msgs[this.duels.cache.info[chanID].game.question.msgId].timesent}`,
                "Ding ding ding!",
                "#00ff00"
            ))
        } else {
            if (this.duels.cache.info[chanID].game.failed == this.duels.cache.info[chanID].game.map[userID]) return [gembed(`You already had a go at this, <@${userID}>!`, '>:{', '#ff0000')]
            if (this.duels.cache.info[chanID].game.failed) {
                emb[0] = gembed(`It apears as both of you have failed! Neither shall receive a point\n${this.msgs.msgs[this.duels.cache.info[chanID].game.question.msgId].content}\` is said by <@${this.msgs.msgs[this.duels.cache.info[chanID].game.question.msgId].author}> on ${this.msgs.msgs[this.duels.cache.info[chanID].game.question.msgId].timesent}`, 'Both of you are dumb,', 'RED')
            } else {
                newQ = false
                this.duels.cache.info[chanID].game.failed = this.duels.cache.info[chanID].game.map[userID]
                emb[0] = gembed(
                    `Now you shut up, and your opponent has to guess!`,
                    "No That's Wrong!",
                    "#ff0000"
                )
            }
        }
        if (newQ) {
            this.duels.cache.info[chanID].game.question = this.makeQuestion()
            this.duels.cache.info[chanID].game.failed = ""
            this.duels.cache.info[chanID].game.qNum++
            if (this.duels.cache.info[chanID].game.qNum == 15) {
                await this.duelFinish(chanID)
                return []
            }
            let progressBar = ''
            for (let i = 0; i < 30; i++) {
                if (i/2 > this.duels.cache.info[chanID].game.qNum) {
                    progressBar += ' '
                } else {
                    progressBar += '▊'
                }
            }
            emb.push(gembed(`
\`\`\`
≫ ${progressBar} ≪
\`\`\`
`, "Progress"))
            emb.push(this.questionEmb(this.duels.cache.info[chanID].game.question))
        }
        await this.duels.writeData()
        await this.user.writeData()
        return emb
    }

    async guess(userID: string, chanID: string, value: string):Promise<MessageEmbed> {
        if (this.cache[chanID].mode == 'notguess') throw 6
        if (this.cache[chanID].date < Date.now()) {
            await this.reset(chanID)
            throw 3
        }
        if (!['1', '2', '3', '4'].includes(value)) throw 4

        let emb:MessageEmbed;
        if (this.cache[chanID].correct == value) {
            const usr = await this.user.answerQuestion(userID, 'yes')
            emb = gembed(
                `Yessir you got it right!\n\`${this.msgs.msgs[this.cache[chanID].msgId].content}\` is said by <@${this.msgs.msgs[this.cache[chanID].msgId].author}> on ${this.msgs.msgs[this.cache[chanID].msgId].timesent}\nYou now have ${this.user.pointCalc(userID)} points, and a ${usr.streak} streak!`,
                "Ding ding ding!",
                "#00ff00"
            );
        } else {
            await this.user.answerQuestion(userID, 'no')
            emb = gembed(
                `The right answer is \`${this.msgs.msgs[this.cache[chanID].msgId].content}\` is said by <@${this.msgs.msgs[this.cache[chanID].msgId].author}> on ${this.msgs.msgs[this.cache[chanID].msgId].timesent}`,
                "No That's Wrong!",
                "#ff0000"
            )
        }
        await this.reset(chanID)
        return emb
    }
    async duelRequest(requester:string, opponent:string, bid:number):Promise<MessageEmbed> {
        if (requester == opponent) throw 'd8'
        if (bid <= 0) throw 'd6'
        await this.user.createByDefault(requester)
        await this.user.createByDefault(opponent)
        if (this.user.pointCalc(requester) >= bid) {
            if (this.user.pointCalc(opponent) >= bid) {
                if (this.duels.cache.occupiedUsers.includes(requester) || this.duels.cache.occupiedUsers.includes(opponent)) throw 'd1'
                const info = {
                    requester,
                    bid,
                    opponent,
                    timeSent: Date.now()
                }
                if (Object.keys(this.duels.cache.requests).includes(requester)) this.duels.cache.requests[requester].push(info)
                else this.duels.cache.requests[requester] = [info]
                await this.duels.writeData()
            } else throw 'd2'
        } else throw 'd3'
        return gembed(`Hey <@${opponent}>! You've been invited to a duel by <@${requester}>. The bid is ${bid}. The winner has a net gain of that bid, and the loser a net loss of that bid
If you don't wanna duel, just ignore this. If you choose to accept it the following will happen:
1. A new channel will be created
3. Rapid fire question will be asked
4. The person which answers first, gets priority
If they are right, the gain 1 point. If they are wrong, they get to shut up until you figure it out (you only have 30 seconds though)
5. After 15 questions, the winner will be determined. They will be awarded the bid`, 'Duel Request')
    }

    async duelAccept(requester:string, opponent:string, guild:Guild):Promise<void> {
        if (!Object.keys(this.duels.cache.requests).includes(requester)) throw 'd4'
        const info = this.duels.cache.requests[requester].find((v) => v.opponent == opponent)
        // bids can't be 0 or below so this works
        if (!info?.bid) throw 'd4'
        delete this.duels.cache.requests[requester]
        const chan = await guild.channels.create(`Duel-${requester}`, {
            parent: process.env.PARENT_ID,
            topic: `${requester} ${opponent}`
        })
        const msg = await chan.send(`<@${requester}> <@${opponent}`)
        await msg.delete()
        this.duels.cache.occupiedUsers.push(requester, opponent)
        this.duels.cache.info[chan.id] = {
            bid: info.bid,
            channel: chan.id,
            opponent,
            requester,
            game: {
                question: this.makeQuestion(),
                opponent: 0,
                requester: 0,
                qNum: 0,
                failed: "",
                map: {}
            }
        }
        this.duels.cache.info[chan.id].game.map[requester] = 'requester'
        this.duels.cache.info[chan.id].game.map[opponent] = 'opponent'
        await this.duels.writeData()
        await chan.send({embeds: [this.questionEmb(this.duels.cache.info[chan.id].game.question)]})
    }

    async duelFinish(chanID:string):Promise<void> {
        const winner: "opponent" | "requester" = this.duels.cache.info[chanID].game.opponent > this.duels.cache.info[chanID].game.requester ? "opponent" : "requester"
        const looser = winner == 'requester' ? 'opponent' : 'requester'
        const winID = this.duels.cache.info[chanID][winner]
        const losID = this.duels.cache.info[chanID][looser]
        const chan = await this.client.channels.fetch(this.duels.cache.info[chanID].channel)
        if (!chan) throw "Channel not found! (btw howP??????)"
        this.user.cache[winID].duel += this.duels.cache.info[chanID].bid
        this.user.cache[losID].duel -= this.duels.cache.info[chanID].bid
        this.user.cache[winID].duels.won++
        this.user.cache[losID].duels.lost++
        [winner, looser].forEach((v) => {
            this.user.cache[this.duels.cache.info[chanID][v]].duels.rightQ += this.duels.cache.info[chanID].game[v]
            this.user.cache[this.duels.cache.info[chanID][v]].duels.wrongQ += this.duels.cache.info[chanID].game[v == 'requester' ? 'opponent' : 'requester']
            this.duels.cache.occupiedUsers[this.duels.cache.occupiedUsers.indexOf(this.duels.cache.info[chanID][v])] = this.duels.cache.occupiedUsers[this.duels.cache.occupiedUsers.length-1];
            this.duels.cache.occupiedUsers.pop()
        })
        
        this.user.cache[winID].duels.streak++
        this.user.cache[winID].scores.duelStreak = this.user.cache[winID].duels.streak > this.user.cache[winID].scores.duelStreak ? this.user.cache[winID].duels.streak : this.user.cache[winID].scores.duelStreak
        this.user.cache[losID].duels.streak = 0

        await (chan as TextBasedChannels).send({embeds: [
            gembed(`Congrats to <@${this.duels.cache.info[chanID][winner]}>! You have just won ${this.duels.cache.info[chanID].bid} :D`, 'Game finished', '#00ff00')
        ]})
        delete this.duels.cache.info[chanID]
        await this.user.writeData()
        await this.duels.writeData()
        await asleep(30 * 1000)
        await chan.delete()
    }

    async duelDeny(requester:string, opponent:string):Promise<void> {
        const info = this.duels.cache.requests[requester].find(v => v.opponent == opponent)
        if (!info?.bid) throw 'd7'
        this.duels.cache.requests[requester][this.duels.cache.requests[requester].indexOf(info)] = this.duels.cache.requests[requester][this.duels.cache.requests[requester].length-1];
        this.duels.cache.requests[requester].pop();
        await (await this.client.users.fetch(requester)).send({embeds: [
            gembed(`Heya, your duel with <@${opponent}> has been denied by them`)
        ]})
        await (await this.client.users.fetch(opponent)).send({embeds: [
            gembed(`Heya, your duel with <@${requester}> has been successfully denied`)
        ]})
        await this.duels.writeData()
    }
}