const utils = require('../../utils')
const d = utils.emojis.d; const b = utils.emojis.b
const Canvas = require('canvas');
Canvas.registerFont('fonts/OpenSans-Bold.ttf', { family: 'Open Sans Bold' })
const getColors = require('get-image-colors')
const guildProfileSc = require('../../schemas/guildProfile')
const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = {
    name: "activity",
    aka: ['level', 'l'],
    config: {
        "useSolidColorBackground": false,
        "showGuildName": false,
        "showUserAvatar": true,
        "embed": true
    },
    async run(toolbox) {
        const { message, args, client } = toolbox
        const { rbgToHex, findBrightestColor } = toolbox.utils

        let user;
        
        if (args[0]) {
            try { user = await client.users.fetch(args[0]) } catch {}
        }
        
        if (message.mentions.members.first() && !user) {
            user = message.mentions.members.first().user
        }
        
        if (!user) {
            user = message.author
        }
        
        const mentionedGuildProfile = await guildProfileSc.findOne({
            guildId: message.guild.id,
            userId: user.id
        })

        const colors = await getColors(user.displayAvatarURL({ format: 'png' }))
        
        const channels = []
        const deletedChannelCount = 0
        const deletedMesages = 0
        Object.keys(mentionedGuildProfile.activity).forEach(channel => {
            if (channel != "overall" && message.guild.channels.cache.get(channel)) {
                channels.push(`<#${channel}> **${mentionedGuildProfile.activity[channel].messages}** messages, **${mentionedGuildProfile.activity[channel].replies}** replies, **${mentionedGuildProfile.activity[channel].spam}** spam`)
            } else if (channel != "overall") {
                deletedChannelCount++;  deletedMesages+=mentionedGuildProfile.activity[channel].messages
            }
        })

        const embed = new MessageEmbed()
        .setAuthor(user.name, user.iconURL())
        .setDescription(`${channels.join('\n')}`)
        .addField('Overall', `**${mentionedGuildProfile.activity.overall.messages}** messages, **${mentionedGuildProfile.activity.overall.replies}** replies, **${mentionedGuildProfile.activity.overall.spam}** spam`)
        .setColor(findBrightestColor(colors).index > -1 ? rbgToHex(colors[findBrightestColor(colors).index]._rgb) : 0xbf943d)
        
        if (deletedChannelCount) embed.addField('Deleted Channels', `**${deletedChannelCount}** deleted channels containing **${deletedMesages}** of your messages.`)
        message.reply({ embeds: [embed] })
    }
}