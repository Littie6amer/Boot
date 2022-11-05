import { CacheType, Interaction, ModalSubmitInteraction, EmbedBuilder, AttachmentBuilder } from "discord.js";
import { Client, ClientEventBase } from "indigo-client";
const sharp = require('sharp');

export default class InteractionCreateEvent extends ClientEventBase {
    constructor(client: Client) {
        super(client, {
            name: "interactionCreate",
        })
    }

    execute(interaction: Interaction): any {
        if (!interaction.isModalSubmit()) return
        const args = interaction.customId.split(":")
        // @ts-ignore
        this[args[0]](interaction, args[1])
    }

    async chatCreate(interaction: ModalSubmitInteraction<CacheType>, categoryId: string) {
        // const name = interaction.fields.getTextInputValue("name")
        const topic = interaction.fields.getTextInputValue("topic")
        const channel = await interaction.guild?.channels.create({ name: "man-idk", topic, parent: categoryId === "undefined" ? undefined : categoryId })
        if (!channel) return;
        const embeds = [
            new EmbedBuilder()
                .setDescription(`**Created channel ${channel}**`)
                .setColor(this.client.embedColor)
        ]
        interaction.reply({ embeds })

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
        ${channel.name}
        </text>
        <text fill="#4b1780" font-size="30" font-family="Verdana" x="60" y="145" width="100">
        ${channel.topic||"No channel topic"}
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

        const attachment = new AttachmentBuilder(img, { name: `${channel.name}.png` });
        embeds[0] = new EmbedBuilder()
            .setColor("#859dfc")
            .setTitle(`Channel Activity`)
            // .setURL(channel.url)
            .setDescription(`<:blue_dot:936976233575616532> 0 messages sent\n<:blue_dot:936976233575616532> 0 unique chatters`)
            .setFields([
                // { name: "Channel Activity", value: `<:blue_dot:936976233575616532> 0 messages sent\n<:blue_dot:936976233575616532> 0 unique chatters` },
                { name: "Top Chatters This Week", value: "No one has sent a message yet!" },
                { name: "Top Chatters Last Week", value: "No one has sent a message yet!" },
            ])
            .setFooter({ text: "Spam messages are not counted!\nUpdates every 10 minutes." });

        await channel.send({ files: [attachment] }).then(m => m.pin());
        return channel.send({ embeds: [embeds[0]] }).then(m => m.pin())
    }
}