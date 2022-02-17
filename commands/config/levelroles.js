const utils = require('../../utils')
const guildProfileSc = require('../../schemas/guildProfile')
const { Command } = require('../../utils');
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');

const command = module.exports = new Command()

command.create(["levelroles", "lr"])
    .setExecute(execute)
    .restrict()

const levelingOptions = [
    { label: "General", value: "general" },
    { label: "Leveling Roles", value: "roles" },
    { label: "Leveling Channels", value: "channels" },
    { label: "Commands", value: "commands" },
]

async function execute(toolbox) {
    const { message, interaction } = toolbox

    let components = [
        new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId("null1")
                .setLabel('Level Roles Selected')
                .setStyle("PRIMARY")
                .setDisabled(true),
            new MessageButton()
                .setCustomId("help:leveling" + (interaction?.member.id || message.member.id))
                .setLabel('Module Page')
                .setStyle("SECONDARY"),
            new MessageButton()
                .setURL('https://boot.tethys.club')
                .setLabel('Documentation')
                .setStyle("LINK"),
        ]),
        new MessageActionRow().addComponents([
            new MessageSelectMenu().setCustomId("leveling:select" + (interaction?.member.id || message.member.id)).addOptions(levelingOptions)
        ]),
    ]

    const embed = new MessageEmbed()
        .setDescription(`Coming soon!`)

    if (interaction?.isSelectMenu()) {
        const values = interaction.customId.slice("leveling:select".length).split('/#~~#/')
        if (values[0] != interaction.member.id) return

        interaction.deferUpdate()
        interaction.message.edit({ embeds: [embed], components })
    } else {
        message.reply({ embeds: [embed], components })
    }
}