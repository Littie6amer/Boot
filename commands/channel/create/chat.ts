import { SlashCommand } from "indigo-client";
import { CategoryChannel, GuildChannelCreateOptions, CategoryCreateChannelOptions, ChannelType, GuildMember, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } from "discord.js"
const sharp = require('sharp');

export const chatCmd = {
    name: "chat",
    description: "...",
    options: [
        {
            name: "name",
            type: "STRING",
            required: true
        },
        {
            name: "category",
            type: "CHANNEL",
            channel_types: ["GUILD_CATEGORY"]
        }
    ],
    async execute(ctx) {
        const { interaction, client } = ctx
        const category = interaction.options.get("category")?.channel as CategoryChannel
        const me = ctx.me
        const member = interaction.member as GuildMember

        if (!(() => {
            const permissions = ["ManageChannels", "ManageRoles"]
            // @ts-ignore
            return category ? ctx.checkPermissions("Channel", { channel: category, member, permissions }) : ctx.checkPermissions("Guild", { member, permissions })
                // @ts-ignore
                || category ? ctx.checkPermissions("Channel", { channel: category, member: me, permissions }) : ctx.checkPermissions("Guild", { member: me, permissions });
        })()) return;

        const name = interaction.options.get("name")?.value as string

        const options: GuildChannelCreateOptions = { type: ChannelType.GuildText, name }
        const channel = await (category ? category.children.create(options as CategoryCreateChannelOptions) : interaction.guild?.channels.create(options))

        if (!channel) return interaction.reply({ content: "No channel was created." })

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

        const embed = new EmbedBuilder()
            .setTitle("Channel Under Construction!")
            .setColor(client.embedColor)
            .setImage(`attachment://${channel.name}.png`)
            .setFooter({ text: "This channel will become unlocked and message counting will begin when you're finshed." })


        const components = [
            new ActionRowBuilder().setComponents([
                new ButtonBuilder().setLabel("Topic").setCustomId("topic").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setLabel("Slowmode").setCustomId("slowmode").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setLabel("Banner").setCustomId("banner").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setLabel("Exclusive Chat").setCustomId("exclusive").setStyle(ButtonStyle.Primary),
            ]),
            new ActionRowBuilder().setComponents([
                new ButtonBuilder().setEmoji("<:cheque:975045403663818822>").setCustomId("finish").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setEmoji("<:cross:975045238164955186>").setCustomId("cancel").setStyle(ButtonStyle.Danger)
            ])
        ]

        await channel?.send({
            // @ts-ignore
            content: `<:crown:824425896417034261> **Created by <@${member.id}> - please complete setup below.**`, embeds: [embed], components, files: [attachment]
        })
    },
} as SlashCommand