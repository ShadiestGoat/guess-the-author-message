import { Commands, gembed } from "./tools";

// 51
// 47
// 2x 48
// 24
// spaces x
// dashes x - 1
const seperator = ``

export const help = gembed(
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