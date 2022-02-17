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
    const { message, args, client, prefixes } = toolbox

    //let emoji = args[0]?.length ? await utils.getEmojiData(args[0], client) : undefined

    if (args.length < 2) return message.reply({
        embeds: [
            new MessageEmbed()
                .setDescription(`\`${prefixes[0]}emoji info :emoji:\`\n\`${prefixes[0]}emoji steal :emoji:\`\n\`${prefixes[0]}emoji create [Emoji Name] (Image Url)\`\n\`${prefixes[0]}emoji delete :emoji:\`\n\`${prefixes[0]}emoji rename :emoji: [Emoji Name]\`\n\`${prefixes[0]}emoji list :emoji: :emoji:\`\n\`${prefixes[0]}emoji list server\``)
                .setColor('BLURPLE')
        ]
    })

    let emojis = []

    let embeds = []
    let components = []

    switch (args[0]) {
        case "info": {
            const emoji = await utils.getEmojiData(args[1], client)

            if (!emoji) return message.reply({ embeds: [utils.embeds.error(`Supply a valid emoji! \`${prefixes[0]}emoji info :emoji:\``)] })

            if (emoji.type == "unicode") {
                let embed = new MessageEmbed()
                    .setDescription(`${emoji.mention}`)
                    .setFooter({ text: "Default discord emoji" })
                    .setColor("GREEN")
                embeds.push(embed)
            }
            else {
                let embed = new MessageEmbed()
                    .setTitle(`:${emoji.name}:`)
                    .setThumbnail(emoji.URLs.common)
                    .setDescription(`${emoji.id}`)
                    .addField("Emoji Tag", `${emoji.mention.replace(":", "*:*")}`)
                    .addField("Emoji Colours", `${emoji.colors.map(c => `[\`#${c.hex} - ${c.name}\`](https://coolors.co/${c.hex})`).join("\n")}`)
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
                embeds.push(embed)
            }
        }; break

        case "list": {
            message.reply("This request may take a while.")
            args[1] == "server" ? emojis.push(...(await getEmojis(message.guild.emojis.cache.map(e => e.toString())))) : emojis.push(...(await getEmojis(args.join(" ").replaceAll("><", "> <").split(" ").slice(1))))

            if (emojis < 1) return message.reply({ embeds: [utils.embeds.error(`Supply valid emojis! \`${prefixes[0]}emoji list :emoji: :emoji:\``)] })

            for (let i = 0; emojis.length / 10 > i; i++) {
                let embed = new MessageEmbed()
                    .setDescription(`${emojis.slice(i * 10, i * 10 + 10).map(e => `${e.mention} ${e.mention.replace(":", "*:*")} [Image](${e.URLs.common})`).join("\n")}`)
                    .setColor("#2f3136")
                if (i == 0) embed.setAuthor({ name: `${message.author.username}'s Emoji List`, url: message.author.avatarURL() })
                embeds.push(embed)
            }
        }; break

        case "delete": {
            if (!message.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return message.reply({
                embeds: [
                    utils.embeds.error("You don't have permission to manage emojis")
                ]
            })
            if (!message.guild.me.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return message.reply({
                embeds: [
                    utils.embeds.error("I don't have permission to manage emojis")
                ]
            })

            let emoji = await message.guild.emojis.cache.get((await utils.getEmojiData(args[1]))?.id)
            if (!emoji) return message.reply({
                embeds: [
                    utils.embeds.error("Invalid emoji!")
                ]
            })
            emoji.delete()
            return message.reply({ embeds: [utils.embeds.success(`**Emoji deleted!** (\`:${emoji.name}:\`)`)] })
        }

        case "create": {
            if (!message.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return message.reply({
                embeds: [
                    utils.embeds.error("You don't have permission to manage emojis")
                ]
            })
            if (!message.guild.me.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return message.reply({
                embeds: [
                    utils.embeds.error("I don't have permission to manage emojis")
                ]
            })
            if (!args[1]) return message.reply({
                embeds: [
                    utils.embeds.error("No name provided for the emoji!")
                ]
            })
            if (!message.attachments.size && !args[2]) return message.reply({
                embeds: [
                    utils.embeds.error("No images provided!")
                ]
            })

            let emoji = await message.guild.emojis.create(message.attachments.size ? message.attachments.first().url : args[2], args[1]).catch(() => {
                return message.reply({ embeds: [utils.embeds.error(`Unable to create emoji \`:${args[1]}:\``)] })
            })

            return message.reply({ embeds: [utils.embeds.success(`**Emoji created!** (\`:${emoji.name}:\`) <${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`)] })
        }; break

        case "rename": {
            if (!message.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return message.reply({
                embeds: [
                    utils.embeds.error("You don't have permission to manage emojis")
                ]
            })
            if (!message.guild.me.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return message.reply({
                embeds: [
                    utils.embeds.error("I don't have permission to manage emojis")
                ]
            })
            let emoji = await message.guild.emojis.cache.get((await utils.getEmojiData(args[1]))?.id)
            if (!emoji) return message.reply({
                embeds: [
                    utils.embeds.error("No emoji provided!")
                ]
            })
            if (!args[2]) return message.reply({
                embeds: [
                    utils.embeds.error("No name provided for the emoji!")
                ]
            })
            await emoji.setName(args[2]).catch(() => {
                return message.reply({ embeds: [utils.embeds.error(`Unable to rename emoji \`:${emoji.name}:\``)] })
            })
            return message.reply({ embeds: [utils.embeds.success(`**Emoji renamed!** (\`:${emoji.name}:\` -> \`:${args[2]}:\`) <${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`)] })
        }; break

        case "steal": {
            const emoji = await utils.getEmojiData(args[1], client)

            if (!emoji) return message.reply({ embeds: [utils.embeds.error(`Supply a valid emoji! \`${prefixes[0]}emoji steal :emoji:\``)] })

            if (emoji.type == "unicode") return message.reply({ embeds: [utils.embeds.error(`Supply a valid emoji! \`${prefixes[0]}emoji steal :emoji:\``)] })

            if (!message.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS") || !message.guild.me.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) {
                return message.reply(emoji.URLs.common)
            } else {
                let e = await message.guild.emojis.create(emoji.URLs.common, emoji.name).catch(() => {
                    return message.reply({ embeds: [utils.embeds.error(`Unable to create emoji \`:${emoji.name}:\``)] })
                })

                return message.reply({ embeds: [utils.embeds.success(`**Emoji created!** (\`:${emoji.name}:\`) <${emoji.animated ? "a" : ""}:${emoji.name}:${e.id}>`)] })
            }
        }; break

        case "rename": {

        }; break
    }

    if (embeds.length) return message.reply({ embeds: embeds.slice(0, 5), components })
}

async function getEmojis(emojiArray) {
    const emojis = [];
    for (let i = 0; i < emojiArray.length; i++) {
        await emojis.push((await utils.getEmojiData(emojiArray[i])))
    }
    return emojis.filter(e => e !== null)
}

function colorInfo(rgb) {
    let hex = []
    let value = rgb[0] * 65536 + rgb[1] * 256 + rgb[2]
    for (let value in rgb) {
        value = rgb[value]
        value = parseInt(value).toString(16)
        value = "00".slice(value.length) + value
        hex.push(value)
    }
    hex = hex.slice(0, 3).join("")
    let name = Color.findClosestColor(`#${hex}`).name
    return { rgb, hex, name, value }
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
        return interaction.message.edit({ content: `<a:greencheck:868670956716052510> **Emoji created!**`, components, embeds: [embed] })
    })
}

async function deleteButton(toolbox) {
    const { interaction } = toolbox
    const values = interaction?.customId.slice("delete:".length).split('/#~~#/') || []
    if (!interaction.member.permissions.has("MANAGE_EMOJIS_AND_STICKERS") || !interaction.message.guild.me.permissions.has("MANAGE_EMOJIS_AND_STICKERS")) return;
    let emoji = interaction.guild.emojis.cache.get(values[0])
    if (!emoji) return;
    emoji.delete()
    return interaction.message.edit({ components: [], embeds: [utils.embeds.success(`**Emoji deleted!** (\`:${emoji.name}:\`)`)] })
}