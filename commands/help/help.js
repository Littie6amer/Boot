const utils = require('../../utils')
const command = new utils.Command()
const { MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed, version } = require('discord.js')

command
    .create(["help", "intro", "i", "h", "info", "stats", "botinfo"])
    .setExecute(execute)
    .addDropOption("help:select", ["helpP1", "helpP2", "helpP3", "helpP4"], dropDownExecute, false)
    .addButton("help:commands", commandsExecute, false)
    .addButton("help:info", infoExecute, false)
    .addButton("help:back", execute, false)
    .makeSlashCommand()

module.exports = command

function execute(toolbox) {
    let { message, interaction, client, args } = toolbox
    const input = interaction || message

    let embed = new MessageEmbed()
        .setAuthor(`${client.user.username} @ ${utils.branch}`, client.user.avatarURL(), "https://github.com/Littie6amer/Litties-Boot")
        .setTitle("Happy Holidays To You!")
        .setDescription(`Keep enjoying the holidays and keep an active discord server! Give people reasons to chat in your server with my leveling module! *Click the button below this message to configure*`)
        .addField('Is that member even active here??', `Litties Boot allows you to view where a member has sent messages and how many. *Click the button below this message to configure*`)
        .addField('I want my members to have roles!!', `Litties Boot allows you to create messages that allow members to assign roles to themselves.  *Click the button below this message to view the commands*`)
        .setFooter(`${client.user.username} @ ${utils.branch}`)
        .setColor("#529b3a")

    let components = [
        new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId("leveling:refresh" + input.member.id)
                .setLabel('Leveling Module')
                .setEmoji("🎄")
                .setStyle("SECONDARY"),
            new MessageButton()
                .setCustomId("activity:refresh" + input.member.id)
                .setLabel('Activity Module')
                .setStyle("SECONDARY"),
            new MessageButton()
                .setCustomId("help:commands" + input.member.id)
                .setLabel('Commands')
                .setStyle("PRIMARY"),
        ]),
        new MessageActionRow().addComponents([
            new MessageButton()
                .setURL("https://boot.tethys.club")
                .setLabel('Every Feature')
                .setEmoji("🎄")
                .setStyle("LINK"),
            new MessageButton()
                .setCustomId("help:info" + input.member.id)
                .setLabel('About Litties Boot')
                .setStyle("PRIMARY"),
        ])
    ]

    if (args && args[0] && args[0].length) {
        const command = client.commands.find(c => c.names.includes(args[0].toLowerCase()))

        components = [
            new MessageActionRow().addComponents([
                new MessageButton()
                    .setCustomId("help:back" + message.author.id)
                    .setLabel('Back')
                    .setStyle("DANGER")
            ])
        ]
        if (command) {
            embed = new MessageEmbed()
                .setAuthor(`${client.user.username} > ${command.names[0]}`)
                .setDescription(command.description)
                .addField('Names', `\`${command.names.join('\`, \`')}\``)
                .addField('Is slash command?', `${command.slashExecute ? true : false}`)
                .setColor(utils.colors.christmasGreen)

        } else {
            embed = new MessageEmbed()
                .setAuthor(`${client.user.username} > Everything`)
                .setThumbnail(client.user.avatarURL())
                .setDescription('Every command that can be used.')
                .addField('Role Selectors', `<:smallboot:901130192007864350> buttonrole\n<:smallboot:901130192007864350> rolelist`, true)
                .addField('Discord Bot Management', `<:smallboot:901130192007864350> botlist\n<:smallboot:901130192007864350> invite`, true)
                .addField('Leveling', `<:smallboot:901130192007864350> level\n<:smallboot:901130192007864350> leveling-settings`, true)
                .addField('General Rewards', `<:smallboot:901130192007864350> rewards\n<:smallboot:901130192007864350> reward-settings`, true)
                .addField('Activity Tracking', `<:smallboot:901130192007864350> activity\n<:smallboot:901130192007864350> activity-settings`, true)
                .setColor(utils.colors.christmasGreen)

        }
    }

    if (interaction?.isButton()) {
        const values = interaction.customId.slice("help:back".length).split('/#~~#/')
        if (values[0] != interaction.member.id) return

        interaction.deferUpdate()
        interaction.message.edit({ embeds: [embed], components })
    } else {
        input.reply({ embeds: [embed], components })
    }
}

function dropDownExecute(toolbox) {
    const { interaction, client } = toolbox
    const values = interaction.customId.slice("help:select".length).split('/#~~#/')
    const embed = new MessageEmbed()

    if (interaction.values[0] == "helpP1") {
        embed
            .setThumbnail(client.user.avatarURL())
            .setAuthor(`${client.user.username} > Utility`)
            .setDescription('The useful commands that you can use!')
            .addField('Role Selectors', `<:smallboot:901130192007864350> buttonrole\n<:smallboot:901130192007864350> rolelist`)
            .addField('Discord Bot Management', `<:smallboot:901130192007864350> botlist\n<:smallboot:901130192007864350> invite`)
            .setColor(utils.colors.christmasGreen)
    }

    if (interaction.values[0] == "helpP2") {
        embed
            .setAuthor(`${client.user.username} > Moderation`)
            .setThumbnail(client.user.avatarURL())
            .setDescription('The useful commands that you can use!')
            .addField('General Moderation', `<:smallboot:901130192007864350> warn\n<:smallboot:901130192007864350> mute\n<:smallboot:901130192007864350> unmute\n<:smallboot:901130192007864350> kick\n<:smallboot:901130192007864350> ban\n<:smallboot:901130192007864350> unban`)
            .setColor(utils.colors.christmasGreen)
    }

    if (interaction.values[0] == "helpP3") {
        embed
            .setAuthor(`${client.user.username} > Leveling`)
            .setThumbnail(client.user.avatarURL())
            .setDescription('The leveling commands you can use!')
            .addField('Leveling', `<:smallboot:901130192007864350> level\n<:smallboot:901130192007864350> leveling-settings`)
            .addField('General Rewards', `<:smallboot:901130192007864350> rewards\n<:smallboot:901130192007864350> reward-settings`)
            .addField('Activity Tracking', `<:smallboot:901130192007864350> activity\n<:smallboot:901130192007864350> activity-settings`)
            .setColor(utils.colors.christmasGreen)
    }

    if (interaction.values[0] == "helpP4") {
        embed
            .setAuthor(`${client.user.username} > Other`)
            .setThumbnail(client.user.avatarURL())
            .setDescription('The other commands you can use!')
            .addField('Testing', `<:smallboot:901130192007864350> trigger`)
            .setColor(utils.colors.christmasGreen)
    }

    if (values[0] != interaction.member.id) return

    const components = [
        new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId("help:back" + values[0])
                .setLabel('Back')
                .setStyle("DANGER")
        ])
    ]

    interaction.deferUpdate()
    return interaction.message.edit({ embeds: [embed], components })

}

function showallExecute(toolbox) {
    const { interaction, client } = toolbox
    const values = interaction.customId.slice("help:showAll".length).split('/#~~#/')
    const embed = new MessageEmbed()
        .setAuthor(`${client.user.username} > Everything`)
        .setThumbnail(client.user.avatarURL())
        .setDescription('Every command that can be used. `!!help [Command Name]`')
        .addField('Role Selectors', `<:smallboot:901130192007864350> buttonrole\n<:smallboot:901130192007864350> rolelist`, true)
        .addField('Discord Bot Management', `<:smallboot:901130192007864350> botlist\n<:smallboot:901130192007864350> invite`, true)
        .addField('Leveling', `<:smallboot:901130192007864350> level\n<:smallboot:901130192007864350> leveling-settings`, true)
        .addField('General Rewards', `<:smallboot:901130192007864350> rewards\n<:smallboot:901130192007864350> reward-settings`, true)
        .addField('Activity Tracking', `<:smallboot:901130192007864350> activity\n<:smallboot:901130192007864350> activity-settings`, true)
        .setColor(utils.colors.christmasGreen)

    const components = [
        new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId("help:back" + values[0])
                .setLabel('Back')
                .setStyle("DANGER")
        ])
    ]

    if (values[0] != interaction.member.id) return

    interaction.deferUpdate()
    return interaction.message.edit({ embeds: [embed], components })
}

function commandsExecute(toolbox) {
    const { interaction, client } = toolbox
    const values = interaction.customId.slice("help:commands".length).split('/#~~#/')
    const embed = new MessageEmbed()
        .setAuthor(`${client.user.username}`)
        .setThumbnail(client.user.avatarURL())
        .setDescription('Important Commands')
        .addField('Role Selectors', `\`!!buttonrole\`\n\`!!rolelist\``,)
        .addField('Discord Bot Management', `\`!!botlist\`\n\`!!invite\``)
        .addField('Leveling', `\`!!rank\`\n\`!!leveling\``)
        .addField('Activity', `\`!!messages\`\n\`!!activity\``)
        .setColor(utils.colors.christmasGreen)

    const components = [
        new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId("help:back" + values[0])
                .setLabel('Back')
                .setStyle("DANGER")
        ])
    ]

    if (values[0] != interaction.member.id) return

    interaction.deferUpdate()
    return interaction.message.edit({ embeds: [embed], components })
}

function infoExecute(toolbox) {
    const { interaction, client } = toolbox
    const values = interaction.customId.slice("help:info".length).split('/#~~#/')
    const embed = new MessageEmbed()
        .setAuthor(`About ${client.user.username}`, client.user.avatarURL(), "https://github.com/Littie6amer/Litties-Boot")
        .setTitle("Its freezing over here!")
        .setDescription(`Litties Boot is a bot created by [Littie6amer](https://discord.com/users/402888568579686401) to be the only bot you'll need. Litties boot is created to be modern, fun and useful! You can always suggest your feature ideas using \`!!suggest\` or make a pull request on the GitHub Repo.`)
        .addField('Bot stats', `<:smallboot:901130192007864350> ${client.guilds.cache.size} servers\n<:smallboot:901130192007864350> ${client.membercount} members\n<:smallboot:901130192007864350> Running thanks to [Node.js](https://nodejs.org) and [Discord.js](https://discord.js.org)`)
        .addField('Github Repo', `Can be found [here](https://github.com/Littie6amer/Litties-Boot)`)
        .addField("Bots", `[Litties Boot](https://discord.com/api/oauth2/authorize?client_id=789211373020250172&permissions=8&scope=bot%20applications.commands)  - Release Branch\n[Litties Boot Red](https://discord.com/api/oauth2/authorize?client_id=876399663002042380&permissions=8&scope=bot%20applications.commands) - Recent Branch\n[Litties Boot Blue]() - Experiment Branch (Coming soon)`)
        .setFooter(`${client.user.username} @ ${utils.branch}`)
        .setColor("#529b3a")


    const components = [
        new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId("help:back" + values[0])
                .setLabel('Back')
                .setStyle("DANGER"),
            new MessageButton()
                .setCustomId("help:info" + values[0])
                .setLabel('Refresh')
                .setEmoji("🎄")
                .setStyle("SECONDARY")
        ])
    ]

    if (values[0] != interaction.member.id) return

    interaction.deferUpdate()
    return interaction.message.edit({ embeds: [embed], components })

}