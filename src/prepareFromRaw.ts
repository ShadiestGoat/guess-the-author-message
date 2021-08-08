import axios, { AxiosResponse } from "axios"
import dotenv from "dotenv"
import { writeFile } from "fs/promises"
import { resolve } from "path"
import Pie from "cli-pie"
import { rand } from "./Components/tools"

// This is the downloader section

// check the env variables
[
    "DW_CHANNEL",
    "DW_TOKEN",
].forEach((env) => {
    if (!process.env[env]) throw `env variable ${env} is required!`
})

type Message<T extends boolean> = {
    id: string,
    content: string,
    author: {
      id: string,
      username: string
    },
    timestamp: T extends true ? number : string
}

type CoolMessage = {
    author: string,
    content: string,
    timesent: string
}

type CoolMessages = {
    authors: string[],
    last: number,
    msgs: Record<string, CoolMessage>
}

const coolCol:[number, number, number][] = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [220, 53, 84],
    [181, 230, 85],
    [27, 188, 155],
    [70, 240, 0],
    [255, 255, 255],
    [255, 255, 0],
    [0, 255, 255],
    [255, 0, 255],
    [187, 7, 125],
    [136, 77, 115],
    [72, 188, 243],
    [41, 98, 255],
    [122, 186, 242],
    [0, 10, 187],
    [180, 10, 0],
    [0, 154, 0],
    [25, 150, 236],
    [25, 233, 133],
    [133, 169, 233],
    [178, 133, 233],
    [161, 233, 133],
]

const timer = (ms:number):Promise<NodeJS.Timeout> => new Promise( res => setTimeout(res, ms));

dotenv.config({})

async function main():Promise<void> {
    const {DW_TOKEN, DW_CHANNEL, MSG_DATA, DW_CONF} = process.env
    const conf = (await import(resolve(DW_CONF ?? './dwConfig.json'))).default
    const authorName:Record<string, {
        name: string,
        col: [number,number,number]
    }> = {}
    let authUpt = false
    const colors:[number, number, number][] = []
    function colGen():[number, number, number] {
        const col = coolCol[rand(0, coolCol.length - 1)]
        if (colors.includes(col)) {
            return colGen()
        }
        colors.push(col)
        return (new Pie).uniqueColor(col)
    }
    const author_alias:Record<string, string> = conf.ALIAS ?? {}
    const author_rm:string[] = conf.REMOVE ?? []
    let first = true
    let done = false
    const msgs:CoolMessages = {authors: [], last: 0, msgs: {}}
    const stats:{
        by_author: Record<string, number>
    } = {
        by_author: {}
    }
    let last = ""
    let ind = 0
    console.clear()

    while (!done) {
        const old:Record<string,{content: string, id: string}> = {}
        let res:AxiosResponse<Record<string, number> | Message<false>[]>;
        try {
            res = await axios.get<Message<false>[] | Record<string, number>>(`https://discordapp.com/api/v9/channels/${DW_CHANNEL}/messages`, {
                headers: {
                    authorization: DW_TOKEN
                },
                params: {
                    limit: 100,
                    before: first ? undefined : last
                },
            })
        } catch (err) {
            throw err
        }
        if (res.status == 429 && !res.data[0]) {
            // rate limmit
            console.warn(`Rate limmit! Retrying after ${(res.data as Record<string, number>).retry_after}`)
            await timer((res.data as Record<string, number>).retry_after/1000)
            res = await axios.get<Message<false>[] | Record<string, number>>(`https://discordapp.com/api/v9/channels/${DW_CHANNEL}/messages`, {
                headers: {
                    authorization: DW_TOKEN
                },
                params: {
                    limit: 100,
                    before: first ? undefined : last
                },
            })
        }
        first = false
        if ((res.data as Message<false>[]).length !== 100) {
            done = true
        } else {
            last = (res.data as Message<false>[])[99].id;
        }
        (res.data as Message<false>[]).forEach((msg:Message<false>) => {
            msg.content = msg.content.replace(new RegExp('https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)', 'g'), '')
            msg.content = msg.content.replace(/<?\:(([^\s])+)?(\d+)?\:(\d+)?>?/g, '')
            msg.content = msg.content.replace(/<.+>/g, '')
            msg.content = msg.content.trim()
            if (author_rm.includes(msg.author.id)) return
            if (Object.keys(author_alias).includes(msg.author.id)) msg.author.id = author_alias[msg.author.id]
            msg.content = msg.content.replace(/\n/g, ' ')
            while (/  /.test(msg.content)) {
                msg.content = msg.content.replace(/  /g, ' ')
            }
            if (!msg.content) return
            if ([...msg.content].some(char => char.charCodeAt(0) > 152)) return
            if (/```.+```/g.test(msg.content)) return
            if (5 > msg.content.split(' ').length) return
            if (msg.content == old[msg.author.id]?.content) {
                delete msgs[old[msg.author.id].id]
                return
            }
            msgs.msgs[ind] = {
                author: msg.author.id,
                content: msg.content,
                timesent:new Date(Date.parse(msg.timestamp)).toUTCString()
            }
            old[msg.author.id] = {
                content: msg.content,
                id: ind.toString()
            }
            if (!msgs.authors.includes(msg.author.id)) msgs.authors.push(msg.author.id)
            ind++

            if (Object.keys(stats.by_author).includes(msg.author.id)) stats.by_author[msg.author.id]++
            else stats.by_author[msg.author.id] = 1
            if (!Object.keys(authorName).includes(msg.author.id)) {
                authorName[msg.author.id] = { name: msg.author.username, col: colGen()} //more colorful stuff :D
                authUpt = true
            }
        })
        if (authUpt) {authUpt = false;console.clear()}

        const p:string = new Pie((process.stdout.columns/7).toFixed(0), 
            Object.keys(stats.by_author).map((val) => {
                return {
                        label: authorName[val].name,
                        value: stats.by_author[val],
                        color: authorName[val].col
                }}), {
                    legend: true,
                    display_total: true
                }).toString()
            process.stdout.write(p.replace(/\n/g, `${' '.repeat(parseInt((process.stdout.columns/16).toFixed(0)))}\n`))
        process.stdout.cursorTo(0,0)
    }
    msgs.last = ind - 1
    const p:string = new Pie((process.stdout.columns/7).toFixed(0), 
            Object.keys(stats.by_author).map((val) => {
                return {
                        label: authorName[val].name,
                        value: stats.by_author[val],
                        color: authorName[val].col
                }}), {
                    legend: true,
                    display_total: true
                }).toString()

    console.log(p.replace(/\n/g, `${' '.repeat(parseInt((process.stdout.columns/16).toFixed(0)))}\n`))
    await writeFile(resolve(`./${MSG_DATA}`), JSON.stringify(msgs))
}

process.on('SIGINT', function() {
    console.clear()
    process.stdout.cursorTo(0, 0)
    process.exit()
})

process.stdout.on('resize', function() {
    console.clear()
})

main().then(() => console.log('donzo!'))