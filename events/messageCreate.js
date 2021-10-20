const guildProfileSc = require('../schemas/guildProfile')
const guildDataSc = require('../schemas/guildData');
const { DiscordAPIError, MessageEmbed } = require('discord.js');
const level = require('../commands/leveling/level');

function getRandomXp () {
    return Math.floor((Math.random()*5)+2)
}

function parseXp (xp) {
    let xpAmounts = [50, 100, 150, 200]
    let level = 0;
    while (xp > xpAmounts[0]) {
        level++; xp -= xpAmounts[0]
        if (xpAmounts[1]) xpAmounts.shift()
    }
    return {level, xp, xpAmounts}
}

module.exports = async (client, message) => {
    const { prefixes } = require('../data/config.json')
    prefixes.push([`<@${client.user.id}>`, `<@!${client.user.id}>`])

    message.channel.myPermissions = message.guild.me.permissionsIn(message.channel.id)
    
    // Return if bot or no message content
    if (message.author.bot || !message.content ||  message.webhookId) return

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
        const leveling = {
            messages: 1,
            xp: getRandomXp(),
            lastXpTimestamp: Date.now(),
        }

        userGuildProfile = {
            guildId: message.guild.id,
            userId: message.author.id,
            leveling
        }

        await guildProfileSc.create(userGuildProfile)
    } else {

        let leveling = userGuildProfile.leveling
        leveling = leveling || {}
        leveling.xp = leveling.xp || 0
        leveling.messages = leveling.messages || 0

        if (!leveling.lastXpTimestamp || Date.now() - leveling.lastXpTimestamp >= 30000) {

            let xpGain = getRandomXp()
            let { beforeGainLevel, afterGainLevel } = {

                beforeGainLevel: parseXp( leveling.xp ),
                afterGainLevel: parseXp( leveling.xp + xpGain )

            }

            if ( beforeGainLevel.level < afterGainLevel.level && message.channel.myPermissions.has('SEND_MESSAGES') && guildData.settings.leveling.levelupMessages ) {
                
                const embed = new MessageEmbed()
                .setDescription(`**Level up!**<:Blank4:801947320064933909>\`Level ${beforeGainLevel.level} -> Level ${afterGainLevel.level}\``)
                .setFooter(`Gained the required ${beforeGainLevel.xpAmounts[0]} xp for level ${afterGainLevel.level}`)
                .setColor(0xbf943d)
                message.reply({ embeds: [embed] })

            }

            leveling.xp += xpGain
            leveling.lastXpTimestamp = Date.now()
            
        }
        
        leveling.messages++

        userGuildProfile.leveling = leveling
        await guildProfileSc.updateOne({
            guildId: message.guild.id,
            userId: message.author.id,
        }, userGuildProfile)
    }

    console.log(`${message.author.tag}: ${userGuildProfile.leveling.xp} xp with ${userGuildProfile.leveling.messages} messages`)

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
            command = client.commands.find(c => c.name == commandName || c.aka.includes(commandName))
            
        }
        
    }
    
    // Run the command
    if (command) {
        if (!message.channel.myPermissions.has('EMBED_LINKS')) return message.channel.send('**I\'m missing Embed Links permission!**')
        const toolbox = {message, args, client, userGuildProfile}
        command.run(toolbox)
    }
}