const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const { Command } = require("../../utils")
const utils = require("../../utils")

const command = module.exports = new Command()

command
    .create(["emoji", "steal"], "Get emoji info")
    .setExecute(execute)
    .addButton("steal:", stealButton, false)

async function execute(toolbox) {
    const { message, args, client } = toolbox

    //if (!args[0]) return utils.embeds.simpleUsageEmbed(command, "Create | Info [Emoji Name | Emoji]")
    let emoji = await utils.getEmojiData(args[0])
    if (!emoji) {
        const embed = await utils.embeds.simpleUsageEmbed(command, ` [Custom Emoji]`)
        return message.reply({ embeds: [embed] })
    } else {
        const embed = new MessageEmbed()
            .setTitle(`:${emoji.name}:`)
            .setThumbnail(emoji.URLs.common)
            .setDescription(`${emoji.id}`)
            .addField("Emoji Tag", `<*:*${emoji.name}:${emoji.id}>`)
            .setColor("#2f3136")
        const components = [
            new MessageActionRow().addComponents([
                new MessageButton().setLabel("Steal").setCustomId("steal:" + emoji.mention).setStyle("DANGER"),
                new MessageButton().setLabel("Png").setURL(emoji.URLs.png).setStyle("LINK")
            ])
        ]
        if (emoji.animated) components[0].addComponents(
            new MessageButton().setLabel("Gif").setURL(emoji.URLs.gif).setStyle("LINK"),
        )
        return message.reply({ embeds: [embed], components })
    }
}

async function stealButton(toolbox) {
    const { interaction } = toolbox
    const values = interaction?.customId.slice("steal:".length).split('/#~~#/') || []
    if (!interaction.member.permissions.has("ADD_EMOJIS") || !interaction.message.guild.me.permissions.has("ADD_EMOJIS")) return;
    let emoji = await utils.getEmojiData(values[0])
    if (!emoji) return;
    interaction.message.guild.emojis.create(emoji.URLs.common, emoji.name).then(e => {
        const embed = new MessageEmbed()
            .setDescription(`<:check:835313672922071140><:Blank1:801947188590411786>**Emoji stolen!**<:Blank1:801947188590411786>\`:${e.name}:\` <:${e.name}:${e.id}>`)
            .setColor("GREEN")
        interaction.reply({ embeds: [embed] })
        const components = [
            new MessageActionRow().addComponents([
                new MessageButton().setLabel("Stolen!").setCustomId("steal:" + emoji.mention).setStyle("SECONDARY").setDisabled(true),
                new MessageButton().setLabel("Png").setURL(emoji.URLs.png).setStyle("LINK")
            ])
        ]
        if (emoji.animated) components[0].addComponents(
            new MessageButton().setLabel("Gif").setURL(emoji.URLs.gif).setStyle("LINK"),
        )
        return interaction.message.edit({components})
    })
}