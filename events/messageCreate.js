const guildProfileSc = require('../schemas/guildProfile')
const guildDataSc = require('../schemas/guildData');
const { DiscordAPIError, MessageEmbed } = require('discord.js');
const utils = require('../utils')

module.exports = async (client, message) => {
    const { prefixes } = require('../data/config.json')
    const { parseXp, getRandomXp } = utils.leveling
    prefixes.push([`<@${client.user.id}>`, `<@!${client.user.id}>`])

    message.channel.myPermissions = message.guild.me.permissionsIn(message.channel.id)

    // Return if bot or no message content
    if (message.author.bot || !message.content || message.webhookId) return

    let guildData = await guildDataSc.findOne({
        guildId: message.guild.id,
    })

    let userGuildProfile = await guildProfileSc.findOne({
        guildId: message.guild.id,
        userId: message.author.id
    })

    if (!guildData) {
        guildData = {
            guildId: message.guild.id,
            settings: {
                leveling: {
                    levelupMessages: true
                }
            }
        }
        await guildProfileSc.create(userGuildProfile)
    }

    // Add comments here
    if (!userGuildProfile) {

        userGuildProfile = {
            guildId: message.guild.id,
            userId: message.author.id,
        }

        await guildProfileSc.create(userGuildProfile)

    }

    let leveling = userGuildProfile.leveling || {}
    leveling = leveling || {}
    leveling.xp = leveling.xp || 0

    let activity = userGuildProfile.activity || {}
    activity.overall = activity.overall || { messages: 0, replies: 0, spam: 0 }
    activity[message.channel.id] = activity[message.channel.id] || { messages: 0, replies: 0, spam: 0 }

    if (!leveling.lastXpTimestamp || Date.now() - leveling.lastXpTimestamp >= 30000) {

        let xpGain = getRandomXp()
        let { beforeGainLevel, afterGainLevel } = {

            beforeGainLevel: parseXp(leveling.xp),
            afterGainLevel: parseXp(leveling.xp + xpGain)

        }

        if (beforeGainLevel.level < afterGainLevel.level && message.channel.myPermissions.has('SEND_MESSAGES') && guildData.settings.leveling.levelupMessages) {

            const embed = new MessageEmbed()
                .setDescription(`**Level up!**<:Blank4:801947320064933909>\`Level ${beforeGainLevel.level} -> Level ${afterGainLevel.level}\``)
                .setFooter(`Gained the required ${beforeGainLevel.xpAmounts[0]} xp for level ${afterGainLevel.level}`)
                .setColor(0xbf943d)
            message.reply({ embeds: [embed] })

        }

        leveling.xp += xpGain
        leveling.lastXpTimestamp = Date.now()

    } else {

        activity.overall.spam++
        activity[message.channel.id].spam++

    }

    if (message.reference) {

        activity.overall.replies++
        activity[message.channel.id].replies++

    }

    activity.overall.messages++
    activity[message.channel.id].messages++

    userGuildProfile.leveling = leveling
    userGuildProfile.activity = activity

    await guildProfileSc.updateOne({
        guildId: message.guild.id,
        userId: message.author.id,
    }, userGuildProfile)

    // Check channel permissions
    if (!message.channel.myPermissions.has('SEND_MESSAGES')) return

    let args, command;

    // Go through prefixes
    for (prefix in prefixes) {

        prefix = prefixes[prefix]
        if (message.content.startsWith(prefix)) {

            // Remove the prefix from content
            let content = message.content.slice(prefix.length);
            if (!content) return

            // Define Arguments
            args = content.split(' ')[1] ? content.split(' ').slice(1) : []

            // Find command
            let commandName = content.split(' ')[0].toLowerCase();
            command = client.commands.find(c => c.name == commandName || c.aka&&c.aka.includes(commandName))

        }

    }

    // Run the command
    if (command) {
        if (!message.channel.myPermissions.has('EMBED_LINKS')) return message.channel.send('**I\'m missing Embed Links permission!**')
        const toolbox = { message, args, client, userGuildProfile, utils }
        command.run(toolbox)
    }
}