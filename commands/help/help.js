const utils = require('../../utils')
const command = new utils.Command()
const { MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed, version } = require('discord.js')

command
    .create(["help", "intro", "i", "h", "info", "stats", "botinfo"])
    .setExecute(execute)
    .addButton("help:home", execute, false)
    .addDropOption("help:select", [""], toolbox => {
        const {interaction} = toolbox
        if (interaction.values[0] == "home") execute(toolbox)
        if (interaction.values[0] == "leveling") levelingPage(toolbox)
        if (interaction.values[0] == "activity") activityPage(toolbox)
        if (interaction.values[0] == "other") otherPage(toolbox)
    }, false)
    .addButton("help:leveling", levelingPage, false)
    .addButton("help:activity", activityPage, false)
    .makeSlashCommand()

module.exports = command

function execute(toolbox) {
    let { message, interaction, client, args } = toolbox
    const input = interaction || message

    let embed = new MessageEmbed()
        .setAuthor({ name: `${client.user.username} @ ${utils.branch}`, iconURL: client.user.avatarURL(), url: "https://github.com/Littie6amer/Litties-Boot" })
        .setTitle("Snow is falling!")
        .setDescription(`Litties Boot allow you to manage your discord server while you're shoveling the snow off you're driveway!`)
        .addField('What can litties boot do?', `<:blue_dot:929844359812231208> [Leveling](https://boot.tethys.club/modules/leveling)\n<:blue_dot:929844359812231208> [Activity Tracking](https://boot.tethys.club/modules/activity)\n<:blue_dot:929844359812231208> [Other Utilities](https://boot.tethys.club/modules/other-utilities)`)
        .setColor("2f3136")

    let components = [
        new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId("null1" + input.member.id)
                .setLabel('Home Page Selected')
                .setStyle("PRIMARY")
                .setDisabled(true),
            new MessageButton()
                .setCustomId("null2" + input.member.id)
                .setLabel(`${client.guilds.cache.size} Servers`)
                .setStyle("SECONDARY")
                .setDisabled(true),
            new MessageButton()
                .setCustomId("null3" + input.member.id)
                .setLabel(`${client.membercount} Users`)
                .setStyle("SECONDARY")
                .setDisabled(true),
            new MessageButton()
                .setURL("https://boot.tethys.club")
                .setLabel('Documentation')
                .setStyle("LINK")
        ]),
        new MessageActionRow().addComponents([
            new MessageSelectMenu().setCustomId("help:select"  + input.member.id).addOptions([
                { label: "Home", value: "home" },
                { label: "Leveling", value: "leveling" },
                { label: "Activity", value: "activity" },
                { label: "Other Utilities", value: "other" },
            ])
        ]),
    ]

    if (args && args[0] && args[0].length) {
        const command = client.commands.find(c => c.names.includes(args[0].toLowerCase()))

        if (command) {
            components[0].components[0].setStyle("SECONDARY")
            components[0].components[0].setLabel(`${command.names[0]} command`)
            embed = new MessageEmbed()
                .setAuthor({ name: `${command.names[0]} command` })
                .setDescription(command.description)
                .addField('Names', `\`${command.names.join('\`, \`')}\``)
                .addField('Is slash command?', `${command.slashExecute ? true : false}`)
                .setColor("2f3136")

        } else {
            components[0].components[0].setLabel(`Could not find command!`).setStyle("DANGER")
        }
    }

    if (interaction?.isSelectMenu()) {
        const values = interaction.customId.slice("help:select".length).split('/#~~#/')
        if (values[0] != interaction.member.id) return

        interaction.deferUpdate()
        interaction.message.edit({ embeds: [embed], components })
    } else {
        input.reply({ embeds: [embed], components })
    }
}

function levelingPage(toolbox) {
    const { interaction, message, client } = toolbox
    const values = interaction.customId.slice(interaction.customId.startsWith("help:select") ? "help:select".length : "help:leveling".length).split('/#~~#/')
    if (values[0] != interaction.member.id) return

    const embed = new MessageEmbed()
        .setAuthor({ name: "Leveling Module", iconURL: client.user.avatarURL() })
        .setDescription("Allow members to gain xp by sending messages and level up by gaining enough xp to do so!")
        .addField("Commands", `\`${utils.prefixes[0]}level\`\n\`${utils.prefixes[0]}leveling-settings\``)
        .setColor("2f3136")

    let components = [
        new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId("null1" + interaction.member.id)
                .setLabel('Leveling Page Selected')
                .setStyle("PRIMARY")
                .setDisabled(true),
            new MessageButton()
                .setCustomId("leveling:general" + interaction.member.id)
                .setLabel(`View Module`)
                .setStyle("SECONDARY"),
            new MessageButton()
                .setURL("https://boot.tethys.club")
                .setLabel('Documentation')
                .setStyle("LINK")
        ]),
        new MessageActionRow().addComponents([
            new MessageSelectMenu().setCustomId("help:select"  + interaction.member.id).addOptions([
                { label: "Home", value: "home" },
                { label: "Leveling", value: "leveling" },
                { label: "Activity", value: "activity" },
                { label: "Other Utilities", value: "other" },
            ])
        ]),
    ]

    interaction.deferUpdate()
    interaction.message.edit({ embeds: [embed], components })
}

function activityPage(toolbox) {
    const { interaction, message, client } = toolbox
    const values = interaction.customId.slice(interaction.customId.startsWith("help:select") ? "help:select".length : "help:activity".length).split('/#~~#/')
    if (values[0] != interaction.member.id) return

    const embed = new MessageEmbed()
        .setAuthor({ name: "Activity tracking Module", iconURL: client.user.avatarURL() })
        .setDescription("Track how active someone has been in a channel!")
        .addField("Commands", `\`${utils.prefixes[0]}messages\`\n\`${utils.prefixes[0]}activity-settings\``)
        .setColor("2f3136")

    let components = [
        new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId("null1" + interaction.member.id)
                .setLabel('Activity Page Selected')
                .setStyle("PRIMARY")
                .setDisabled(true),
            new MessageButton()
                .setCustomId("activity:general" + interaction.member.id)
                .setLabel(`View Module`)
                .setStyle("SECONDARY"),
            new MessageButton()
                .setURL("https://boot.tethys.club")
                .setLabel('Documentation')
                .setStyle("LINK")
        ]),
        new MessageActionRow().addComponents([
            new MessageSelectMenu().setCustomId("help:select"  + interaction.member.id).addOptions([
                { label: "Home", value: "home" },
                { label: "Leveling", value: "leveling" },
                { label: "Activity", value: "activity" },
                { label: "Other Utilities", value: "other" },
            ])
        ]),
    ]

    interaction.deferUpdate()
    interaction.message.edit({ embeds: [embed], components })
}

function otherPage(toolbox) {
    const { interaction, message, client } = toolbox
    const values = interaction.customId.slice(interaction.customId.startsWith("help:select") ? "help:select".length : "help:activity".length).split('/#~~#/')
    if (values[0] != interaction.member.id) return

    const embed = new MessageEmbed()
        .setAuthor({ name: "Other Utilities", iconURL: client.user.avatarURL() })
        .setDescription("Litties Boot utility commands")
        .addField("Role Management", `\`${utils.prefixes[0]}buttonrole\``)
        .addField("Emoji Management", `\`${utils.prefixes[0]}emoji get\`\n\`${utils.prefixes[0]}emoji palette\`\n\`${utils.prefixes[0]}emoji colors\`\n\`${utils.prefixes[0]}emoji delete\`\n\`${utils.prefixes[0]}emoji create\``)
        .addField("Bot Management", `\`${utils.prefixes[0]}invite\`\n\`${utils.prefixes[0]}botlists\``)
        .setColor("2f3136")

    let components = [
        new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId("null1" + interaction.member.id)
                .setLabel('Utilties Page Selected')
                .setStyle("PRIMARY")
                .setDisabled(true),
            new MessageButton()
                .setURL("https://boot.tethys.club")
                .setLabel('Documentation')
                .setStyle("LINK")
        ]),
        new MessageActionRow().addComponents([
            new MessageSelectMenu().setCustomId("help:select"  + interaction.member.id).addOptions([
                { label: "Home", value: "home" },
                { label: "Leveling", value: "leveling" },
                { label: "Activity", value: "activity" },
                { label: "Other Utilities", value: "other" },
            ])
        ]),
    ]

    interaction.deferUpdate()
    interaction.message.edit({ embeds: [embed], components })
}