const utils = require('../../utils')
const command = new utils.Command()
const getColors = require('get-image-colors')
const guildProfileSc = require('../../schemas/guildProfile')
const { MessageEmbed, MessageActionRow, MessageButton, Interaction } = require('discord.js');

command
    .create(["messages", "m"])
    .setExecute(execute)
    .addButton("messages:", execute, false)
    .makeSlashCommand()

module.exports = command

async function execute(toolbox) {
    const { message, args, client, interaction } = toolbox
    const { rbgToHex, findBrightestColor } = utils
    const input = interaction || message

    const values = interaction?.customId.slice("messages:".length).split('/#~~#/')
    if (values && (values[0] != interaction.member.id)) return

    let user;

    if (args && args[0]) {
        try { user = await client.users.fetch(args[0]) } catch { }
    }

    if (message && message.mentions.members.first() && !user) {
        user = message.mentions.members.first().user
    }

    if (!user) {
        user = input.member.user
    }

    const mentionedGuildProfile = await guildProfileSc.findOne({
        guildId: input.guild.id,
        userId: user.id
    })

    const colors = await getColors(user.displayAvatarURL({ format: 'png' }))

    const channels = []
    let deletedChannelCount = 0
    let deletedMesages = 0
    if (mentionedGuildProfile?.activity) Object.keys(mentionedGuildProfile.activity.channels).forEach(channel => {
        channel = mentionedGuildProfile.activity.channels[channel]
        if (message.guild.channels.cache.get(channel.id)) {
            if (message.member.permissions.has("MANAGE_MESSAGES")) {
                channels.push(`<#${channel.id}> **${channel.messages}** messages, **${channel.replies}** replies, **${channel.spam}** spam`)
            } else {
                channels.push(`<#${channel.id}> **${channel.messages}** messages, **${channel.replies}** replies`)
            }
        } else {
            deletedChannelCount++; deletedMesages += channel.messages
        }
    })

    const components = [new MessageActionRow().addComponents([
        new MessageButton().setCustomId('rank:' + user.id).setEmoji('👤').setLabel('Rank').setStyle('SECONDARY'),
        new MessageButton().setCustomId('rewards:' + user.id).setEmoji('🎁').setLabel('Rewards').setStyle('SECONDARY'),
    ])]

    const embed = new MessageEmbed()
        .setAuthor(user.username, user.avatarURL())
        .setDescription(`${channels?.join('\n') ? `<:smallboot:901130192007864350> ${channels?.join('\n<:smallboot:901130192007864350> ')}` : `<:redboot:902910668091576331> **No data collected on this user**`} ${deletedChannelCount ? `\n<:reply:902678138109194241> **${deletedChannelCount}** deleted channel${deletedChannelCount > 1 ? "s" : ""} with **${deletedMesages}** messages.` : ""}`)
        .setColor(findBrightestColor(colors).index > -1 ? rbgToHex(colors[findBrightestColor(colors).index]._rgb) : 0xbf943d)
    if (mentionedGuildProfile?.activity?.overall) {
        if (message.member.permissions.has("MANAGE_MESSAGES")) {
            embed.addField('Overall', `<:smallboot:901130192007864350> **${mentionedGuildProfile.activity.overall.messages}** messages, **${mentionedGuildProfile.activity.overall.replies}** replies, **${mentionedGuildProfile.activity.overall.spam}** spam`)
        } else {
            embed.addField('Overall', `<:smallboot:901130192007864350> **${mentionedGuildProfile.activity.overall.messages}** messages, **${mentionedGuildProfile.activity.overall.replies}** replies`)
        }
    }
    if (interaction?.message) {
        interaction.deferUpdate()
        interaction.message.edit({ embeds: [embed], components, attachments: [] })
    } else {
        input.reply({ embeds: [embed], components })
    }
}
