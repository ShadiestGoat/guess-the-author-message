import { ApplicationCommandData, ColorResolvable, MessageEmbed } from "discord.js";

export function gembed(
    desc: string,
    title = "\n",
    col: ColorResolvable = '#3D3D92',
    fields: { inline: boolean; name: string; value: string }[] = [],
    imageurl?: string,
    thumbnail?: string,
    timestamp = false,
    footer?: { content: string; image: string }
):MessageEmbed {
    const embed = new MessageEmbed()
        .setTitle(title)
        .setColor(col)
        .setDescription(desc);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (imageurl) embed.setImage(imageurl)
        // typeof imageurl == "string"
            // : embed.setImage(imageurl)
                    // .attachFiles([imageurl.file])
                    // .setImage(`attachment://${imageurl.name}`);
    if (timestamp) embed.setTimestamp();
    if (footer)
        embed.setFooter(footer.content, footer.image ? footer.image : undefined);
    for (const field of fields) {
        try {
            embed.addField(field.name, field.value, field.inline);
        } catch (error) {
            embed.addField(field.name, field.value, true);
        }
    }
    return embed;
}

export type commands = 's' | 
                       'g' | 
                       'n' | 
                       'leaders' | 
                       'prestige' | 
                       'stats' | 
                       'challenge' |
                       'accept' |
                       'reject' |
                       'help' 

export const Commands:(ApplicationCommandData & {name: commands})[] = [
    {
        name: 's',
        description: 'Skip your question, -1 points, save your streak'
    },
    {
        name: "g",
        description: "Answer your question",
        options: [
            {
                name: "value",
                description: "answer option",
                type: "STRING",
                choices: [
                    { name: "Option 1", value: "1" },
                    { name: "Option 2", value: "2" },
                    { name: "Option 3", value: "3" },
                    { name: "Option 4", value: "4" },
                ],
                required: true,
            },
        ],
    },
    {
        name: "leaders",
        description: "See the leaderboard",
    },
    {
        name: "prestige",
        description: "Clear all data, increase multiplier"
    },
    {
        name: "stats",
        description: "See yourpersonal stats",
        options: [
            {
                name: "user",
                description: "the use you want to see stats off",
                type: "USER",
                required: false,
            },
        ],
    },
    {
        name: "n",
        description: "New question",
    },
    {
        name: "help",
        description: "Displays help command",
    },
    {
        name: 'challenge',
        description: 'Challange a player to a duel',
        options: [
            {
                name: 'user',
                description: 'the user of who you want to challenge',
                type: 'USER',
                required: true
            },
            {
                name: 'bid',
                description: 'the bid of the duel',
                type: 'INTEGER',
                required: true
            }
        ],
    },
    {
        name: 'reject',
        description: 'Reject a player\'s duel request',
        options: [
            {
                name: 'user',
                description: 'the user id of who you want to reject of',
                type: 'USER',
                required: true
            }
        ]
    },
    {
        name: 'accept',
        description: 'Accept a player\'s duel request',
        options: [
            {
                name: 'user',
                description: 'the user id of who you want to accept of',
                type: 'USER',
                required: true
            }
        ]
    }
]

export const rand = (min: number, max: number):number => Math.floor(Math.random() * (max - min + 1)) + min

export const asleep = (milliseconds:number):Promise<NodeJS.Timeout> => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const seperator = ``

export const helpEMB = gembed(
    `This is a simple game, where you have to guess who sent the fucking message. This can be done through channels under a certain category, or DMs :D
You first have to make a new question, then guess it. You can also skip the question if your really want to, though it removes some points (steak dependent).
There is a lot more for you to learn, but, you can learn yourself :D.
\`\`\`
    Full list of commands
  Available prefixes: / | - | <no prefix>
${seperator}${Commands.map((val) =>  
    `\n${val.name}${(val.options ?? []).map((opts) => ` ${opts.required ? '<' : '['}${opts.name}${opts.required ? '>' : ']'}`).join('')} - ${(val.options ?? []).length == 0 ? '' : '\n  '}${val.description}${(val.options ?? []).map((opts) => `\n  ${opts.name} - ${opts.required ? 'required! ' : ''}${opts.description}`).join('')}\n${seperator}`
).join('')}
\`\`\`
`);