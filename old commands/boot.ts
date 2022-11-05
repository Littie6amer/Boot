import { Client, CommandContext, SlashCommandBase } from "indigo-client";
import { AttachmentBuilder, ChannelType } from "discord.js"
const sharp = require('sharp');

export class Command_ extends SlashCommandBase {
    constructor(client: Client) {
        super(client, {
            name: "boot",
            description: "The boot command needs a better description",
        })
    }
    async execute(ctx: CommandContext) {
        if (!ctx.interaction.channel || ctx.interaction.channel.type == ChannelType.DM) return
        // const fetchImage = async (url: string) => (await axios({ url, responseType: "arraybuffer" })).data as Buffer
        const text = Buffer.from(`<svg height="200" width="1000">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgb(166, 98, 233);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(133, 157, 252);stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="1000" height="300" fill="url(#grad1)" />
        <rect x="60" y="40" rx="5" ry="5" width="60" height="60" fill="#40126e" />
        <text fill="rgb(166, 98, 233)" font-size="45" font-family="Arial Black" x="74" y="85">
        #
        </text>
        <text fill="#40126e" font-size="45" font-family="Arial Black" x="135" y="85">
        ${ctx.interaction.channel.name || ""}
        </text>
        <text fill="#4b1780" font-size="30" font-family="Verdana" x="60" y="145" width="100">
        aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa aaa
        </text>
        <text fill="#4b1780" font-size="30" font-family="Verdana" x="900" y="85" text-anchor="end">
        Chat
        </text>
        </svg>`)
        const img = await sharp({
            create: {
                width: 1000,
                height: 200,
                channels: 4,
                background: { r: 36, g: 36, b: 36 }
            }
        }).composite([
            { input: text, top: 0, left: 0 },
        ]).png().toBuffer()

        const attachment = new AttachmentBuilder(img, { name: `${ctx.interaction.channel.name || "channel"}.png` });
        ctx.interaction.reply({ files: [attachment] })
    }
}