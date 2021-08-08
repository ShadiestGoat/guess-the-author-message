import { Client, Guild, GuildChannel, GuildMember, MessageEmbed, TextBasedChannels, User } from "discord.js"
import dotenv from "dotenv"
import { questionMgr } from "./Components/calsses"
import { Commands, commands, gembed } from "./Components/tools";
import { help } from "./Components/other"
import { exit } from "process";

dotenv.config()

const {TOKEN, COMMANDS_UPDATED} = process.env;
// check the env variables
[
    "PARENT_ID",
    "TOKEN",
].forEach((env) => {
    if (!process.env[env]) throw `env variable ${env} is required!`
})


const client = new Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
    partials: ['CHANNEL'],
    allowedMentions: {
        parse: ['users'] 
    }
});

const main = new questionMgr(client)


const  _commands:commands[] = Commands.map((val) => val.name)

const errors:Record<string, string> = {
    1: "You have to guess first!",
    2: "You don't have enough points to prestige!",
    3: 'Haha too late (you have 30 seconds)',
    4: 'The is a bad value. The value must be 1, 2, 3, 4!',
    5: 'You don\'t even have a question yet!',
    6: 'You don\'t have a question!',
    7: "You have no Data recorded!",
    8: "Bad type for option!",
    9: "Hold on tight (5-10 seconds), the bot still isn't fully ready ^^",
    d1: "One of you is already in a duel!",
    d2: "Your opponent is too poor for this bid!",
    d3: "You are too poor for this bid!",
    d4: "What are you even trying to accept?",
    d5: "There is no PARENT_ID Specified!",
    d6: "What are you, too poor to afford a bigger bid? Request DENIED!",
    d7: "Can't deny something that doesn't exist...",
    d8: "Can't challenge yourself :/"
}

client.on("ready", async () => {
    await main.init()

    if (COMMANDS_UPDATED) {
        Commands.forEach(async (v) => {
            await client.application?.commands.create(v)
        })
        console.log("ready (commands added!)");
    } else {
        console.log("ready (commands not added)");
    }
});

type ew<T extends Record<commands, unknown>> = T
type Opt2T = ew<{
    g: string,
    stats: User | GuildMember,
    help: undefined,
    leaders: undefined,
    n: undefined,
    prestige: undefined,
    s: undefined,
    accept: User | GuildMember,
    challenge: User | GuildMember,
    reject: User | GuildMember
}>

type ToStringBad<T> = {
    [K in keyof T]: T[K] extends undefined ? undefined :
                    T[K] extends string ? 'string' :
                    T[K] extends number ? 'number' :
                    T[K] extends User | GuildMember ? 'user' :
                    'unknown'
}

const Opt2Opts:ToStringBad<Opt2T> = {
    g: 'string',
    stats: 'user',
    accept: 'user',
    challenge: 'user',
    reject: 'user',
    help: undefined,
    leaders: undefined,
    n: undefined,
    prestige: undefined,
    s: undefined
}


async function commander<C extends commands>(reply:(e:MessageEmbed[]) => Promise<unknown>, userID:string, chan: TextBasedChannels, commandName:C, opt2?:Opt2T[C], opt3?: string | Guild):Promise<void> {
    if (!main.inited) throw 0
    try {
    if (!chan.isText() || !((chan as GuildChannel).parentId == process.env.PARENT_ID || chan.type == 'DM')) return
    let duelMode = false
    // duel ignore checking
    if (chan.type == "GUILD_TEXT" && chan.name.startsWith('duel-')) {
        // make sure that the user is actually in the duel
        if (!Object.keys(main.duels.cache.info).includes(chan.id)) return //safe guard just in case
        if (!Object.keys(main.duels.cache.info[chan.id]?.game.map).includes(userID)) return
        duelMode = true
    }

    if (!_commands.includes(commandName)) return
        switch (commandName) {
            case "g":
                if (typeof opt2 != 'string') throw 8
                if (duelMode) {
                    const d = await main.duelGuess(chan.id, userID, typeof opt2 == "string" ? opt2 : '') ?? []
                    if (d.length) await reply(d)
                } else {
                    await reply([await main.guess(userID, chan.id, typeof opt2 == "string" ? opt2 : '')]);
                }
                return;
            case 'challenge':
                if (typeof opt2 != 'object') throw 8
                if (!opt3) throw 8
                if (typeof opt3 != 'string') throw 8
                if (isNaN(parseInt(opt3))) throw 8
                await reply([await main.duelRequest(userID, opt2.id, parseInt(opt3))])
                return
            case 'reject':
                if (typeof opt2 != 'string') throw 8
                await main.duelDeny(opt2, userID)
                return
            case 'accept':
                if (typeof opt2 != 'string') throw 8
                if (typeof opt3 == 'string') throw 8
                if (!opt3) throw 8
                await main.duelAccept(opt2, userID, opt3)
                return
            case "help":
                await reply([help])
                return;
            case "leaders":
                await reply([main.user.leaderboard(userID)]);
                return;
            case "n":
                await reply([await main.comNew(chan.id)]);
                return;
            case "prestige":
                await reply([await main.user.prestige(userID)])
                return
            case "s":
                await reply([await main.s(chan.id, userID)])
                return
            case "stats":
                await reply([main.user.stats((opt2 as GuildMember | User)?.id ?? userID)]);
                return;
        }
    } catch (err) {
        err = err.toString()
        if (Object.keys(errors).includes(err)) await reply([gembed(errors[err], 'Weewoo Error!', 'RED')])
        else {
            console.error(err)
            await reply([gembed("Woah there bucckkarrroodle you caused some unexpected stuff to happen:\n`" + err + '`', '', 'RED')]) //look man idk what i was even going for here but I'm not 'fixing' this
        }
    }   
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName == "accept" && !interaction.guild) {
        await interaction.reply({embeds: [
            gembed('You can only do this in a server!', 'Weewooo its an error here!', 'RED')
        ]})
        return
    }
    let opts:Opt2T[commands];
    switch(Opt2Opts[interaction.commandName]) {
        case "string":
            opts = interaction.options.getString('value') ?? ''
            break
        case "user":
            opts = interaction.options.getUser('user') ?? { id: interaction.user.id } as User
            break
    }
    await commander(async (embed) => await interaction.reply({embeds: embed}), interaction.user.id, interaction.channel as TextBasedChannels, interaction.commandName  as commands, opts, interaction.commandName == "accept" ? interaction.guild as Guild : interaction.options.getInteger('bid')?.toString())
})

client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;    
    msg.content = msg.content.toLowerCase().trim()
    
    const commandName = msg.content.length == 2 && msg.content[0] == "g" ? 'g' : ((msg.content.startsWith('-') ? 
                        msg.content.substr(1) : 
                        msg.content.startsWith(`<@${client.user?.id}>`) ? 
                        msg.content.substr(18 + 3) : 
                        msg.content
                        ).trim().split(' ')[0]) as commands
    
    let opts:Opt2T[commands]
    switch(Opt2Opts[commandName]) {
        case "string":
            opts = msg.content.length == 2 && msg.content[0] == 'g' ? msg.content[1] : msg.content.split(' ')[1]
            break
        case "user":
            opts = msg.mentions.users.first() ?? {id: msg.content.split(' ')[1]} as User
            break
    }
    if (commandName == "accept" && !msg.guild) throw 8 
    await commander(async (embed) => await msg.channel.send({embeds: embed}), msg.author.id, msg.channel, commandName, opts, commandName == "accept" ? msg.guild as Guild : msg.content.split(' ')[2])
})

client.login(TOKEN)



// in case of anything :D
process.on('SIGINT', () => {
    main.writeAllData().then(() => {
        exit()
    })
})