const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js')
const guildDataSc = require('../../schemas/guildData')
const guildProfileSc = require('../../schemas/guildProfile')
const utils = require('../../utils')
const { Command, prefixes } = require('../../utils')
const ms = require('ms')

const command = module.exports = new Command()

command.create(['activity', 'activity-settings', 'a'])
    .setExecute(execute)
    .addButton("activity:general", execute, false)
    .addDropOption("activity:select", [""], toolbox => {
        const { interaction } = toolbox
        if (interaction.values[0] == "general") execute(toolbox)
        if (interaction.values[0] == "commands") commandsExecute(toolbox)
    }, false)
    .addButton("activity:reset", resetExecute, false)

async function execute(toolbox) {
    const { message, client, guildData, args, interaction, userGuildProfile } = toolbox
    const values = interaction?.customId.slice(interaction?.customId?.startsWith("activity:select") ? "activity:select".length : "activity:general".length).split('/#~~#/') || []
    let { _id, __v, ...guildData_ } = guildData.toObject()
    const configEmbed = utils.activity.configEmbed

    if (values.length && values[0] != interaction.member.id) return
    if ((utils.branch == "release" && message.guild.members.cache.get("876399663002042380"))) return message.channel.send("Please use <@876399663002042380> instead!")

    let embed = new MessageEmbed()
        .setColor("2f3136")

    let components = []
    if (!interaction && !message.member.permissions.has('MANAGE_GUILD') && !userGuildProfile.bypass || interaction && !interaction.member.permissions.has('MANAGE_GUILD')) {
        embed.setAuthor({ name: "Activity - " + message.guild.name, url: message.guild.iconURL() })
            .setDescription('<a:redcross:868671069786099752> You do not have permission to manage this server!')
            .setColor('RED')
        return message.reply({ embeds: [embed] })
    }

    components = [
        new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId("null1")
                .setLabel('General Page Selected')
                .setStyle("PRIMARY")
                .setDisabled(true),
            new MessageButton()
                .setCustomId("help:activity" + (interaction?.member.id || message.member.id))
                .setLabel('Module Page')
                .setStyle("SECONDARY"),
            new MessageButton()
                .setURL('https://boot.tethys.club')
                .setLabel('Documentation')
                .setStyle("LINK"),
        ]),
        new MessageActionRow().addComponents([
            new MessageSelectMenu().setCustomId("activity:select" + (interaction?.member.id || message.member.id)).addOptions([
                { label: "General", value: "general" },
                { label: "Commands", value: "commands" },
            ])
        ]),
    ]
    switch (args ? args[0]?.toLowerCase() : undefined) {
        case undefined:
            embed = configEmbed(guildData, message, ["xp", "message"])
            if (interaction) {
                interaction.deferUpdate()
                message.edit({ embeds: [embed], components, })
            } else {
                message.reply({ embeds: [embed], components })
            }
            break
        case "disable":
            guildData.activity.enabled = false
            guildData.save()
            embed = configEmbed(guildData, message, ["xp"])
            message.reply({ embeds: [embed] })
            break
        case "enable":
            guildData.activity.enabled = undefined
            guildData.save()
            guildData.activity.enabled = true
            embed = configEmbed(guildData, message, ["xp"])
            message.reply({ embeds: [embed] })
            break
        case "data":
            if (args[1] == "reset") {
                if (!args[2]) {
                    message.reply({
                        content: "Are you sure?", components: [
                            new MessageActionRow().addComponents(
                                new MessageButton().setCustomId("activity:resetall/#~~#/" + (interaction?.member.id || message.member.id)).setLabel('Reset Activity Data for Everyone').setStyle("DANGER").setEmoji("💥")
                            )
                        ]
                    })
                    break
                }
                let user;
                try { user = await client.users.fetch(args[2].replace("<@", "").replace("!", "").replace(">", "")) } catch { }
                if (user) {
                    message.reply({
                        content: "Are you sure?", components: [
                            new MessageActionRow().addComponents(
                                new MessageButton().setCustomId(`activity:reset${user.id}/#~~#/${(interaction?.member.id || message.member.id)}`).setLabel(`Reset Activity Data for ${user.username}`).setStyle("DANGER").setEmoji("💥")
                            )
                        ]
                    })
                    break
                }
                break
            }
            break
    }
}

function commandsExecute(toolbox) {
    const { message, interaction } = toolbox
    const values = interaction?.customId.slice("activity:select".length).split('/#~~#/') || []

    if (values.length && values[0] != interaction.member.id) return

    const embed = new MessageEmbed()
        .setAuthor(message.guild.name, message.guild.iconURL())
        .addField('View your messages', `\`${utils.prefixes[0]}messages\``)
        .addField('Module', `\`${utils.prefixes[0]}activity [enable | disable]\`\n\`${utils.prefixes[0]}activity data reset\`\n\`${utils.prefixes[0]}activity data reset [@user | User ID]\``)
        .setFooter("Module Commands")
        .setColor("2f3136")

    const components = [
        new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId("null1")
                .setLabel('Command Page Selected')
                .setStyle("PRIMARY")
                .setDisabled(true),
            new MessageButton()
                .setCustomId("help:activity" + (interaction?.member.id || message.member.id))
                .setLabel('Module Page')
                .setStyle("SECONDARY"),
            new MessageButton()
                .setURL('https://boot.tethys.club')
                .setLabel('Documentation')
                .setStyle("LINK"),
        ]),
        new MessageActionRow().addComponents([
            new MessageSelectMenu().setCustomId("activity:select" + (interaction?.member.id || message.member.id)).addOptions([
                { label: "General", value: "general" },
                { label: "Commands", value: "commands" },
            ])
        ]),
    ]

    interaction.deferUpdate()
    message.edit({ embeds: [embed], components })
}

async function resetExecute(toolbox) {
    const { interaction } = toolbox
    const values = interaction?.customId.slice("activity:reset".length).split('/#~~#/') || []

    if (interaction.member.id != values[1]) return
    if (!interaction.message.guild.members.cache.get(values[1])?.permissions.has("MANAGE_GUILD")) return

    if (values[0] == "all") {
        guildProfileSc.updateMany({ guildId: interaction.message.guild.id }, { activity: {} }).catch(e => {
            interaction.reply({ content: `**Welp!** Seems like something went wrong!\n\`\`\`${e}\`\`\``, components: [new MessageActionRow().addComponents(new MessageButton().setLabel('Report The Error!').setURL("https://discord.gg/adYXN5pa8X").setStyle("LINK"))] })
            console.log(`[Boot Manager Error]: Error resetting data`)
            console.log(`~~~`)
            return console.error(e);
        })

        interaction.message.edit({ embeds: [], components: [], content: `<@${interaction.member.id}> reset everyone's levels` })
    } else {
        const data = await guildProfileSc.findOne({ guildId: interaction.message.guild.id, userId: values[0] })
        if (data) {
            data.activity = undefined; data.save().catch(e => {
                interaction.reply({ content: `**Welp!** Seems like something went wrong!\n\`\`\`${e}\`\`\``, components: [new MessageActionRow().addComponents(new MessageButton().setLabel('Report The Error!').setURL("https://discord.gg/adYXN5pa8X").setStyle("LINK"))] })
                console.log(`[Boot Manager Error]: Error resetting data`)
                console.log(`~~~`)
                return console.error(e);
            })
        }

        interaction.message.edit({ embeds: [], components: [], content: `<@${interaction.member.id}> reset <@${values[0]}>'s levels` })
    }
}