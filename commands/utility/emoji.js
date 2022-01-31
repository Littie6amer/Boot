const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js")
const { Command } = require("../../utils")
const utils = require("../../utils")

const command = module.exports = new Command()

command
    .create(["e", "emoji", "steal"], "Manage emojis")
    .setExecute(execute)
    .addButton("steal:", stealButton, false)
    .addButton("delete:", deleteButton, false)

async function execute(toolbox) {
    const { message, args, client } = toolbox

    //let emoji = args[0]?.length ? await utils.getEmojiData(args[0], client) : undefined

    if (args.length < 2) return message.reply({
        embeds: [
            new MessageEmbed()
                .setDescription(`\`${utils.prefixes[0]}emoji get :emoji:\`\n\`${utils.prefixes[0]}emoji colors :emoji:\`\n\`${utils.prefixes[0]}emoji palette :emoji: :emoji:\`\n\`${utils.prefixes[0]}emoji palette guild\`\n\`${utils.prefixes[0]}emoji delete :emoji:\`\n\`${utils.prefixes[0]}emoji create [Emoji Name] [Image Url]\``)
                .setColor('BLURPLE')
        ]
    })

    let emojis = []

    let embed = new MessageEmbed()
    let components = []

    switch (args[0]) {
        case "get": {
            const emoji = await utils.getEmojiData(args[1], client)

            if (!emoji) return message.reply({ embeds: [utils.embeds.error(`Supply a valid emoji! \`${utils.prefixes[0]}emoji get :emoji:\``)] })

            if (emoji.type == "unicode") embed
                .setDescription(`${emoji.mention}`)
                .setFooter({ text: "Default discord emoji" })
                .setColor("GREEN")

            else {
                embed
                    .setTitle(`:${emoji.name}:`)
                    .setThumbnail(emoji.URLs.common)
                    .setDescription(`${emoji.id}`)
                    .addField("Emoji Tag", `${emoji.mention.replace(":", "*:*")}`)
                    .setColor(emoji.guildId ? "GREEN" : "#2f3136")

                if (emoji.guildId) embed.setFooter({ text: emoji.guildId == message.guild.id ? "From this server" : "Usable by Litties Boot" })

                let messageActionRow = new MessageActionRow()

                if (!emoji.guildId || emoji.guildId != message.guild.id) messageActionRow.addComponents(
                    new MessageButton().setLabel("Steal").setCustomId("steal:" + emoji.mention).setStyle("DANGER"),
                )
                else messageActionRow.addComponents(
                    new MessageButton().setLabel("Delete").setCustomId("delete:" + emoji.id).setStyle("DANGER"),
                )

                messageActionRow.addComponents(new MessageButton().setLabel("Png").setURL(emoji.URLs.png).setStyle("LINK"))

                if (emoji.animated) messageActionRow.addComponents(
                    new MessageButton().setLabel("Gif").setURL(emoji.URLs.gif).setStyle("LINK"),
                )

                components.push(messageActionRow)
            }
        }; break

        case "palette": {
            args[1] == "guild" ? emojis.push(...(await getEmojis(message.guild.emojis.cache.map(e => e.toString())))) : emojis.push(...(await getEmojis(args.join(" ").replaceAll("><", "> <").split(" ").slice(1))))

            if (emojis < 1) return message.reply({ embeds: [utils.embeds.error(`Supply valid emojis! \`${utils.prefixes[0]}emoji pallete :emoji: :emoji:\``)] })

            embed
                .setAuthor({ name: `${message.author.username}'s Emoji Palette`, url: message.author.avatarURL() })
                .setDescription(`${emojis.map(e => `${e} ${e.replace(":", "*:*")}`).join("\n")}`)
                .setColor("#2f3136")
        }; break
    }

    return message.reply({ embeds: [embed], components })
}

async function getEmojis(emojiArray) {
    const emojis = [];
    for (let i = 0; i < emojiArray.length; i++) {
        await emojis.push((await utils.getEmojiData(emojiArray[i])).mention)
    }
    return emojis.filter(e => e !== null)
}

async function stealButton(toolbox) {
    const { interaction } = toolbox
    const values = interaction?.customId.slice("steal:".length).split('/#~~#/') || []
    if (!interaction.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS") || !interaction.message.guild.me.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return;
    let emoji = await utils.getEmojiData(values[0])
    if (!emoji) return;
    interaction.message.guild.emojis.create(emoji.URLs.common, emoji.name).then(async e => {
        emoji = await utils.getEmojiData(`<${e.animated ? "a" : ""}:${e.name}:${e.id}>`)
        const embed = new MessageEmbed()
            .setTitle(`:${emoji.name}:`)
            .setThumbnail(emoji.URLs.common)
            .setDescription(`${emoji.id}`)
            .addField("Emoji Tag", `<*:*${emoji.name}:${emoji.id}>`)
            .setFooter({ text: "From this server" })
            .setColor("GREEN")
        const components = [
            new MessageActionRow().addComponents([
                new MessageButton().setLabel("Delete").setCustomId("delete:" + emoji.id).setStyle("DANGER"),
                new MessageButton().setLabel("Png").setURL(emoji.URLs.png).setStyle("LINK")
            ])
        ]
        if (emoji.animated) components[0].addComponents(
            new MessageButton().setLabel("Gif").setURL(emoji.URLs.gif).setStyle("LINK"),
        )
        interaction.deferUpdate()
        return interaction.message.edit({ content: `<a:greencheck:868670956716052510> **Emoji added!**`, components, embeds: [embed] })
    })
}

async function deleteButton(toolbox) {
    const { interaction } = toolbox
    const values = interaction?.customId.slice("delete:".length).split('/#~~#/') || []
    if (!interaction.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS") || !interaction.message.guild.me.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return;
    let emoji = interaction.guild.emojis.cache.get(values[0])
    if (!emoji) return;
    emoji.delete()
    return interaction.message.edit({ content: `<a:greencheck:868670956716052510> **Emoji deleted!** (\`:${emoji.name}:\`)`, components: [], embeds: [] })
}