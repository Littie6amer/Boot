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
                .setDescription(`\`${prefixes[0]}emoji info [Emoji Name]\`\n\`${prefixes[0]}emoji info :emoji:\`\n\`${prefixes[0]}emoji create :emoji: :emoji: :emoji:\`\n\`${prefixes[0]}emoji create [Emoji Name] (Image Url)\`\n\`${prefixes[0]}emoji delete :emoji:\`\n\`${prefixes[0]}emoji rename :emoji: [Emoji Name]\`\n\`${prefixes[0]}emoji list :emoji: :emoji:\`\n\`${prefixes[0]}emoji list server\``)
                .setColor('BLURPLE')
        ]
    })

    let emojis = []

    let embeds = []
    let components = []

    switch (args[0]) {
        case "info": {
            const emoji = args[1].includes("<") ? await utils.getEmojiData(args[1], client) : await utils.getEmojiData("<:"+(message.guild.emojis.cache.find(e => e.name.toLowerCase().startsWith(args[1].toLowerCase())).identifier)+">", client)

            if (!emoji) return message.reply({ embeds: [utils.embeds.error(`Supply a valid emoji! \`${prefixes[0]}emoji info :emoji:\``)] })

            if (emoji.type == "unicode") {
                let embed = new MessageEmbed()
                    .setDescription(`${emoji.mention}`)
                    .setFooter({ text: "Default discord emoji" })
                    .setColor("GREEN")
                embeds.push(embed)
            }
            else {
                const c = emoji.colors[0]
                let embed = new MessageEmbed()
                    .setTitle(`:${emoji.name}:`)
                    .setThumbnail(emoji.URLs.common)
                    .setDescription(`${emoji.id}`)
                    .addField("Emoji Tag", `${emoji.mention.replace(":", "*:*")}`)
                    .addField("Dominant Colour", `[\`#${c.hex} - ${c.name}\`](https://coolors.co/${c.hex})`)
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

            let count = 0; let stuff = []
            for (let i = 0; emojis.length > i; i++) {
                let e = emojis[i];
                let panel = `${e.mention} ${e.mention.replace(":", "*:*")} [Image](${e.URLs.common})\n`;
                if (count + panel.length < 4000) {
                    count += panel.length; stuff.push(panel)
                } else {
                    let embed = new MessageEmbed()
                        .setDescription(`${stuff.join("")}`)
                        .setColor("#2f3136")
                    if (i == 0) embed.setAuthor({ name: `${message.author.username}'s Emoji List`, url: message.author.avatarURL() })
                    embeds.push(embed)
                    stuff = []; count = panel.length; stuff.push(panel)
                }
                // let embed = new MessageEmbed()
                //     .setDescription(`${emojis.slice(i * 10, i * 10 + 10).map(e => `${e.mention} ${e.mention.replace(":", "*:*")} [Image](${e.URLs.common})`).join("\n")}`)
                //     .setColor("#2f3136")
                // if (i == 0) embed.setAuthor({ name: `${message.author.username}'s Emoji List`, url: message.author.avatarURL() })
                // embeds.push(embed)
            }
            if (stuff.length && count < 4000) {
                let embed = new MessageEmbed()
                    .setDescription(`${stuff.join("")}`)
                    .setColor("#2f3136")
                if (!embeds.length) embed.setAuthor({ name: `${message.author.username}'s Emoji List`, url: message.author.avatarURL() })
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

            let emoji = args[1].includes("<") ? await message.guild.emojis.cache.get((await utils.getEmojiData(args[1]))?.id) : message.guild.emojis.cache.find(e => e.name.toLowerCase().startsWith(args[1].toLowerCase()))
            if (!emoji) return message.reply({
                embeds: [
                    utils.embeds.error("Invalid emoji!")
                ]
            })
            emoji.delete()
            return message.reply({ embeds: [utils.embeds.success(`**Emoji deleted!** (\`:${emoji.name}:\`)`)] })
        }

        case "create":
        case "steal": {
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
                    utils.embeds.error("No emoji or name provided!")
                ]
            })
            if (!message.attachments.size && !args[2] && !args.join(" ").includes("<")) return message.reply({
                embeds: [
                    utils.embeds.error("No images provided!")
                ]
            })

            if (!args.join(" ").includes("<")) {
                let emoji = await message.guild.emojis.create(message.attachments.size ? message.attachments.first().url : args[2], args[1]).catch(() => {
                    return message.reply({ embeds: [utils.embeds.error(`Unable to create emoji \`:${args[1]}:\``)] })
                })
                return message.reply({ embeds: [utils.embeds.success(`**Emoji created!** (\`:${emoji.name}:\`) <${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`)] })
            } else {
                let emojis = args.slice(1).join(" ").split("><").join("> <").split(" ")

                message.reply({ content: `Preparing to add emojis. This may take a while` })

                for (let emoji in emojis) {
                    e = await utils.getEmojiData(emojis[emoji], client)
                    if (!e || e.type == "unicode") emojis[emoji] = null
                    else emojis[emoji] = e
                }

                emojis = emojis.filter(e => e != null)

                if (!emojis.length) return message.reply({ embeds: [utils.embeds.error(`Supply a valid emoji(s)! \`${prefixes[0]}emoji create :emoji: :emoji:\``)] })

                let successful = []
                for (let emoji in emojis) {
                    emoji = emojis[emoji]
                    if (message.guild.emojis.cache.length != 50) await message.guild.emojis.create(emoji.URLs.common, emoji.name).then(e => successful.push(e)).catch(() => null)
                }
                const unsuccessful = emojis.filter(e => !successful.find(emoji => emoji.name == e.name))
                // return message.reply({ embeds: [utils.embeds.error(`Unable to create emoji \`:${emoji.name}:\``)] })
                if (!successful.length) return message.reply({ embeds: [utils.embeds.error(`Unable to create emojis, has your server hit the emoji limit?`)] })
                if (unsuccessful.length) message.reply({ embeds: [utils.embeds.error(`**Unable to create Emoji(s)** ${unsuccessful.map(emoji => `\`:${emoji.name}:\``).join(", ")}`)] })
                return message.reply({ embeds: [utils.embeds.success(`**Emoji(s) created!**\n${successful.map(emoji => `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}> \`:${emoji.name}:\``).join("\n")}`)] })
            }
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