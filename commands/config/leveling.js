const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js')
const guildDataSc = require('../../schemas/guildData')
const guildProfileSc = require('../../schemas/guildProfile')
const utils = require('../../utils')
const { Command } = require('../../utils')
const ms = require('ms')

const command = module.exports = new Command()

command.create(['leveling', 'leveling-settings', 'ls'])
    .setExecute(execute)
    .addButton("leveling:general", execute, false)
    .addDropOption("leveling:select", [""], toolbox => {
        const { interaction } = toolbox
        if (interaction.values[0] == "general") execute(toolbox)
        if (interaction.values[0] == "rewards") rewardsExecute(toolbox)
        if (interaction.values[0] == "commands") commandsExecute(toolbox)
    }, false)
    .addButton("leveling:reset", resetExecute, false)

async function execute(toolbox) {
    const { message, client, guildData, args, interaction, userGuildProfile } = toolbox
    const values = interaction?.customId?.slice(interaction?.customId?.startsWith("leveling:select") ? "leveling:select".length : "leveling:general".length).split('/#~~#/')
    const configEmbed = utils.leveling.configEmbed
    const schema = guildDataSc.schema.obj.leveling

    if (values?.length && values[0] != interaction.member.id) return
    if ((utils.branch == "release" && message.guild.members.cache.get("876399663002042380"))) return message.channel.send("Please use <@876399663002042380> instead!")

    let embed = new MessageEmbed()
        .setColor("#529b3a")

    if (!interaction && !message.member.permissions.has('MANAGE_GUILD') && !userGuildProfile.bypass || interaction && !interaction.member.permissions.has('MANAGE_GUILD')) {
        embed.setAuthor({ name: "Leveling - " + message.guild.name, iconURL: message.guild.iconURL() })
            .setDescription('<a:redcross:868671069786099752> You do not have permission to manage this server!')
            .setColor('RED')
        return message.reply({ embeds: [embed] })
    }
    let components = [
        new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId("null1")
                .setLabel('General Settings Selected')
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
            new MessageSelectMenu().setCustomId("leveling:select" + (interaction?.member.id || message.member.id)).addOptions([
                { label: "General", value: "general" },
                { label: "Rewards", value: "rewards" },
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
            guildData.leveling.enabled = false
            guildData.save()
            embed = configEmbed(guildData, message, ["xp"])
            message.reply({ embeds: [embed] })
            break
        case "enable":
            guildData.leveling.enabled = undefined
            guildData.save()
            guildData.leveling.enabled = true
            embed = configEmbed(guildData, message, ["xp"])
            message.reply({ embeds: [embed] })
            break
        case "message":
            if (args[1] == "content") {
                if (!args[2]) {
                    embed = new MessageEmbed(); embed.setDescription(`\`${utils.prefixes[0]}leveling messsage content [content | reset]\``)
                        .setColor('RED')
                    message.reply({ embeds: [embed] })
                    break
                }
                if (args[2] == "reset") {
                    guildData.leveling.message.content = undefined
                    guildData.save()
                    guildData.leveling.message.content = schema.message.content.default
                    embed = configEmbed(guildData, message, ["message"])
                    const messagePreview = await utils.leveling.levelUpMessageVars(schema.message.content.default, toolbox.userGuildProfile, message, 50000)
                    message.channel.send(guildData.leveling.message.embed ? { embeds: [new MessageEmbed().setColor(utils.colors.gold).setDescription(messagePreview)], allowedMentions: { parse: ["users"] } } : { content: messagePreview, allowedMentions: { parse: ["users"] } })
                    message.reply({ embeds: [embed] })
                    break
                }
                const messagePreview = await utils.leveling.levelUpMessageVars(args.slice(2).join(' '), toolbox.userGuildProfile, message, 50000)
                guildData.leveling.message.content = args.slice(2).join(' ')
                guildData.save()
                embed = configEmbed(guildData, message, ["message"])
                message.channel.send(guildData.leveling.message.embed ? { embeds: [new MessageEmbed().setColor(utils.colors.gold).setDescription(messagePreview)], allowedMentions: { parse: ["users"] } } : { content: messagePreview, allowedMentions: { parse: ["users"] }})
                message.reply({ embeds: [embed] })
                break
            }
            if (args[1] == "embed") {
                if (args[2] && args[2] == "enable") {
                    guildData.leveling.message.embed = undefined
                    guildData.save()
                    embed.setDescription('Level up messages are now embeded')
                    message.reply({ embeds: [embed] })
                    break
                }
                if (args[2] && args[2] == "disable") {
                    guildData.leveling.message.embed = false
                    guildData.save()
                    embed.setDescription('Level up messages are no longer embeded')
                    message.reply({ embeds: [embed] })
                    break
                }
                embed = new MessageEmbed(); embed.setDescription(`\`${utils.prefixes[0]}leveling messsage embed [enable | disable]\``)
                    .setColor('RED')
                message.reply({ embeds: [embed] })
                break
            }
            if (args[1] == "enable") {
                guildData.leveling.message.enabled = undefined
                guildData.save()
                embed.setDescription('Level up messages are now enabled')
                message.reply({ embeds: [embed] })
                break
            }
            if (args[1] == "disable") {
                guildData.leveling.message["enabled"] = false
                guildData.save()
                embed.setDescription('Level up messages were disabled')
                message.reply({ embeds: [embed] })
                break
            }
            if (args[1] == "channel") {
                let channel;
                if (args[2] && message.guild.channels.cache.get(args[2].replace("<#", "").replace(">", ""))) {
                    channel = message.guild.channels.cache.get(args[2].replace("<#", "").replace(">", "")).id
                    if (!message.guild.me.permissionsIn(channel).has("SEND_MESSAGES")) {
                        embed = new MessageEmbed(); embed.setColor("RED").setDescription('Missing permissions to speak there!')
                        message.reply({ embeds: [embed] })
                        break
                    }
                }

                if (!channel) {
                    channel = "ANY"
                }

                guildData.leveling.message.channel = channel
                guildData.save()
                embed = configEmbed(guildData, message, ["message"])
                message.reply({ embeds: [embed] })
                break
            }
            embed = new MessageEmbed().setDescription(`\`${utils.prefixes[0]}leveling messsage content [content]\`\n\`${utils.prefixes[0]}leveling messsage embed [enable | disable]\`\n\`${utils.prefixes[0]}leveling messsage [enable | disable]\`\n\`${utils.prefixes[0]}leveling messsage channel [#channel | any]\``)
                .setColor('BLURPLE')
            message.reply({ embeds: [embed] })
            break
        case "xp":
            if (args[1] == "rate") {
                if (args[2] == "reset") {
                    guildData.leveling.xp.rate = [2, 5];
                    await guildData.save()
                    guildData.leveling.xp.rate = [2, 5]
                    embed = configEmbed(guildData, message, ["xp"])
                    message.reply({ embeds: [embed] })
                    break
                }
                if (!args[2] || !args[3] || isNaN(args[2] + args[3])) {
                    embed = new MessageEmbed().setDescription('Please provide a minimum and maximum!')
                        .setColor("RED")
                    message.reply({ embeds: [embed] })
                    break
                }
                guildData.leveling.xp.rate = [Number(args[2]), Number(args[3])]
                guildData.save()
                embed = configEmbed(guildData, message, ["xp"])
                message.reply({ embeds: [embed] })
                break
            }
            if (args[1] == "timeout") {
                let length = args.slice(2).join(" ")
                length = length.length && isNaN(length) ? ms(length) : Number(length)
                if (!length) {
                    embed.setColor("RED").setDescription('Please a time length!')
                    message.reply({ embeds: [embed] })
                    break
                }
                if (length > 18000000) {
                    embed = new MessageEmbed().setColor("RED").setDescription('Timeout cannot be longer than 5 hours!')
                    message.reply({ embeds: [embed] })
                    break
                }
                guildData.leveling.xp.timeout = length
                guildData.save()
                embed = configEmbed(guildData, message, ["xp"])
                message.reply({ embeds: [embed] })
                break
            }
            embed = new MessageEmbed(); embed.setDescription(`\`${utils.prefixes[0]}leveling xp rate [Least] [Most]\`\n\`!!leveling xp timeout [time length]\``)
                .setColor('BLURPLE')
            message.reply({ embeds: [embed] })
            break
        case "data":
            if (args[1] == "reset") {
                if (!args[2]) {
                    message.reply({
                        content: "Are you sure?", components: [
                            new MessageActionRow().addComponents(
                                new MessageButton().setCustomId("leveling:resetall/#~~#/" + (interaction?.member.id || message.member.id)).setLabel('Reset Leveling Data for Everyone').setStyle("DANGER").setEmoji("💥")
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
                                new MessageButton().setCustomId(`leveling:reset${user.id}/#~~#/${(interaction?.member.id || message.member.id)}`).setLabel(`Reset Leveling Data for ${user.username}`).setStyle("DANGER").setEmoji("💥")
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

function rewardsExecute(toolbox) {
    const { message, interaction } = toolbox
    const values = interaction?.customId.slice("leveling:select".length).split('/#~~#/') || []

    if (values.length && values[0] != interaction.member.id) return

    const embed = new MessageEmbed()
        .setDescription(':gift: **Coming soon!**')
        .setColor("WHITE")

        let components = [
            new MessageActionRow().addComponents([
                new MessageButton()
                    .setCustomId("null1")
                    .setLabel('Reward Page Selected')
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
                new MessageSelectMenu().setCustomId("leveling:select" + interaction.member.id).addOptions([
                    { label: "General", value: "general" },
                    { label: "Rewards", value: "rewards" },
                    { label: "Commands", value: "commands" },
                ])
            ]),
        ]

    interaction.deferUpdate()
    message.edit({ embeds: [embed], components })
}

async function resetExecute(toolbox) {
    const { interaction } = toolbox
    const values = interaction.customId.slice("leveling:reset".length).split('/#~~#/')

    if (interaction.member.id != values[1]) return
    if (!interaction.message.guild.members.cache.get(values[1])?.permissions.has("MANAGE_GUILD")) return

    if (values[0] == "all") {
        guildProfileSc.updateMany({ guildId: interaction.message.guild.id }, { leveling: {} }).catch(e => {
            interaction.reply({ content: `**Welp!** Seems like something went wrong!\n\`\`\`${e}\`\`\``, components: [new MessageActionRow().addComponents(new MessageButton().setLabel('Report The Error!').setURL("https://discord.gg/adYXN5pa8X").setStyle("LINK"))] })
            console.log(`[Boot Manager Error]: Error resetting data`)
            console.log(`~~~`)
            return console.error(e);
        })

        interaction.message.edit({ embeds: [], components: [], content: `<@${interaction.member.id}> reset everyone's levels` })
    } else {
        const data = await guildProfileSc.findOne({ guildId: interaction.message.guild.id, userId: values[0] })
        if (data) {
            data.leveling = undefined; data.save().catch(e => {
                interaction.reply({ content: `**Welp!** Seems like something went wrong!\n\`\`\`${e}\`\`\``, components: [new MessageActionRow().addComponents(new MessageButton().setLabel('Report The Error!').setURL("https://discord.gg/adYXN5pa8X").setStyle("LINK"))] })
                console.log(`[Boot Manager Error]: Error resetting data`)
                console.log(`~~~`)
                return console.error(e);
            })
        }

        interaction.message.edit({ embeds: [], components: [], content: `<@${interaction.member.id}> reset <@${values[0]}>'s levels` })
    }
}

function commandsExecute(toolbox) {
    const { interaction, message, client } = toolbox
    const values = interaction.customId.slice("leveling:select".length).split('/#~~#/')
    if (values[0] != interaction.member.id) return

    const embed = new MessageEmbed()
        .setAuthor({ name: "Leveling Module Commands", iconURL: interaction.guild.iconURL() })
        .addField('View your level', `\`!!level\``)
        .addField('Module', `\`!!leveling [enable | disable]\`\n\`!!leveling data reset\`\n\`!!leveling data reset [@user | User ID]\``)
        .addField('Xp', `\`!!leveling xp rate [minimum] [maximum]\`\n\`!!leveling xp timeout [time length]\``)
        .addField('Levelup Messages', `\`!!leveling messages [enable | disable]\`\n\`!!leveling message content [message]\`\n\`!!leveling message embed [enable | disable]\`\n\`!!leveling message channel [#channel]\`\n[Leveling message variables](https://boot.tethys.club/vars/level-up-messages)`)
        .setFooter({ text: "Leveling Module", iconURL: "https://cdn4.iconfinder.com/data/icons/ui-actions/21/gear_cog-256.png" })
        .setColor("2f3136")

    let components = [
        new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId("null1")
                .setLabel('Command Page Selected')
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
            new MessageSelectMenu().setCustomId("leveling:select" + interaction.member.id).addOptions([
                { label: "General", value: "general" },
                { label: "Rewards", value: "rewards" },
                { label: "Commands", value: "commands" },
            ])
        ]),
    ]

    interaction.deferUpdate()
    interaction.message.edit({ embeds: [embed], components })
}