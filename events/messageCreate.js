const guildDataSc = require('../schemas/guildData');
const guildProfileSc = require('../schemas/guildProfile')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const utils = require('../utils')
const process_settings = require("../process-settings")
const { parseXp, getRandomXp } = utils.leveling
const ms = require('ms');

module.exports = async (client, message) => {
    const prefixes = process_settings.defaultPrefixes
    prefixes.push([`<@${client.user.id}>`, `<@!${client.user.id}>`])

    message.channel.myPermissions = message.guild.me.permissionsIn(message.channel.id)

    let first = false
    // Return if bot or no message content
    if (!message.content || message.webhookId) return

    let guildData;
    if (client.dbState == "connected") guildData = await guildDataSc.findOne({
        guildId: message.guild.id,
    })

    let userGuildProfile;
    if (client.dbState == "connected") userGuildProfile = await guildProfileSc.findOne({
        guildId: message.guild.id,
        userId: message.author.id
    })

    if (client.dbState == "connected" && !guildData) {
        guildData = await guildDataSc.create({
            guildId: message.guild.id
        })
    }

    if (client.dbState == "connected" &&  !userGuildProfile) {
        userGuildProfile = await guildProfileSc.create({
            guildId: message.guild.id,
            userId: message.author.id,
        })
        first = true
    }

    if (client.dbState == "connected" &&  guildData.activity.enabled && !(process_settings.name == "release branch" && message.guild.members.cache.get("876399663002042380"))) {

        if (!userGuildProfile.activity.channels.find(c => c.id == message.channel.id)) userGuildProfile.activity.channels.push({ id: message.channel.id, messages: 0, replies: 0, spam: 0 })

        if (!userGuildProfile.activity.spamTimestamp || Date.now() - userGuildProfile.activity.spamTimestamp >= 10000) {
            userGuildProfile.activity.spamBuildup = 1
            userGuildProfile.activity.spamTimestamp = Date.now()
        //} else if (userGuildProfile.activity.spamBuildup > 7) {
            //message.channel.send(message.author.username+", you're taking the piss now")
        } else if (userGuildProfile.activity.spamBuildup > 4) {
            userGuildProfile.activity.overall.spam++
            userGuildProfile.activity.channels.find(c => c.id == message.channel.id).spam++
            message.spam = true
            // if (message.channel.myPermissions.has('MANAGE_MESSAGES') && message.deletable) message.react("987677196078444544")
            // if (message.channel.myPermissions.has('MANAGE_MESSAGES') && message.deletable) message.delete()
            userGuildProfile.activity.spamBuildup++
        } else {
            userGuildProfile.activity.spamBuildup = userGuildProfile.activity.spamBuildup + 1 || 1
        }

        if (message.reference) {
            userGuildProfile.activity.overall.replies++
            userGuildProfile.activity.channels.find(c => c.id == message.channel.id).replies++
        }

        userGuildProfile.activity.overall.messages++
        userGuildProfile.activity.channels.find(c => c.id == message.channel.id).messages++

    }

    if (client.dbState == "connected" && guildData.leveling.enabled && !message.spam && !(process_settings.name == "release branch" && message.guild.members.cache.get("876399663002042380"))) {

        if (!userGuildProfile.leveling.lastXpTimestamp || Date.now() - userGuildProfile.leveling.lastXpTimestamp >= guildData.leveling.xp.timeout) {

            userGuildProfile.leveling.lastXpTimestamp = Date.now()
            let xpGain = getRandomXp(guildData.leveling.xp.rate)
            let { beforeGainLevel, afterGainLevel } = {
                beforeGainLevel: parseXp(userGuildProfile.leveling.xp),
                afterGainLevel: parseXp(userGuildProfile.leveling.xp + xpGain)
            }

            if (beforeGainLevel.level < afterGainLevel.level && message.channel.myPermissions.has('SEND_MESSAGES') && guildData.leveling.message.enabled && !message.author.bot) {
                let channel = message.guild.channels.cache.get(guildData.leveling.message.channel)
                if (channel && !message.guild.me.permissionsIn(channel?.id).has("SEND_MESSAGES")) delete channel

                const LevelUpMessage = await utils.leveling.levelUpMessageVars(guildData.leveling.message.content, userGuildProfile, message, xpGain)

                const embed = new MessageEmbed()
                    .setDescription(LevelUpMessage)
                    .setFooter(`View your level and xp progress with ${process_settings.defaultPrefixes[0]}level`)
                    .setColor(0xbf943d)

                const data = {}
                if (guildData.leveling.message.embed) {
                    data.embeds = [embed]
                } else {
                    data.content = LevelUpMessage
                }
                if (guildData.leveling.message.channel == "ANY") {
                    if (!message.deleted) message.reply(data)
                } else if (channel) {
                    data.content = (data.content ? '<@' + message.member.id + '>,\n' + data.content : '<@' + message.member.id + '>')
                    channel.send(data)
                }
            }

            userGuildProfile.leveling.xp += xpGain

        }

    }
    if (client.dbState == "connected" && !(process_settings.name == "release branch" && message.guild.members.cache.get("876399663002042380"))) {
        if (first) {
            guildProfileSc.updateOne({
                guildId: message.guild.id,
                userId: message.author.id,
            }, userGuildProfile)
        } else {
            //userGuildProfile.markModified('leveling', 'leveling.lastXpTimestamp', 'leveling.xp', 'activity', 'activity.spamBuildup', 'activity.spamTimestamp', 'activity.overall', 'activity.overall.messages')
            userGuildProfile.markModified('activity.channels');
            await userGuildProfile.save().catch(e => {
                console.log(`[Boot Manager Error]: Code error with saving leveling data`)
                console.log(`~~~`)
                console.error(e);
            })
        }
    }

    if (message.spam || message.deleted) return

    // Check channel permissions
    if (!message.channel.myPermissions.has('SEND_MESSAGES') || !message.channel.myPermissions.has('READ_MESSAGE_HISTORY') || message.author.bot) return

    let args, command;

    // Go through prefixes
    for (prefix in prefixes) {

        prefix = prefixes[prefix]
        if (message.content.toLowerCase().startsWith(prefix.toString().toLowerCase())) {

            // Remove the prefix from content
            let content = message.content.slice(prefix.length)[0]?.startsWith(' ') ? message.content.slice(prefix.length + 1) : message.content.slice(prefix.length);
            if (!content) return

            // Define Arguments
            args = content.split(' ') ? content.split(' ').filter(a => a) : []

            // Find command
            let commandName = args.shift().toLowerCase();
            command = client.commands.find(c => c.names.includes(commandName))
        }

    }

    // Run the command
    if (command && client.dbState == "connected") {
        // Check if the command restriction allows the author to run the command
        if (command.restricted && !["685218525379690584", "402888568579686401", "725104609689075745", "272563498251321344"].includes(message.author.id)) return

        // Check if there is a cooldown
        const cooldown = client.cooldowns[message.author.id] ? client.cooldowns[message.author.id][command.names[0]] : null

        if (cooldown && Date.now() - cooldown < command.cooldown) {
            return message.reply({ content: `You can use this command again in ${ms(command.cooldown - (Date.now() - cooldown), { long: true })}` })
        }

        // Run the command
        const toolbox = { message, args, client, userGuildProfile, guildData, prefixes };
        (userGuildProfile.preview && command.previewExecute ? command.previewExecute(toolbox) : command.execute(toolbox))?.catch(e => {
            message.reply({ content: `**Welp!** Seems like something went wrong!\n\`\`\`${e}\`\`\``, components: [new MessageActionRow().addComponents(new MessageButton().setLabel('Report The Error!').setURL("https://discord.gg/M8t7x64deZ").setStyle("LINK"))] })
            console.log(`[Boot Manager Error]: Code error with the ${command.names[0]} command`)
            console.log(`~~~`)
            console.error(e)
        })

        // Add a cooldown
        if (command.cooldown && !userGuildProfile?.bypass) {
            const time = Date.now()
            client.cooldowns[message.author.id] = client.cooldowns[message.author.id] || {}
            client.cooldowns[message.author.id][command.names[0]] = time

            // Delete the cooldown after it ends
            setTimeout(() => {
                if (client.cooldowns[message.author.id] && client.cooldowns[message.author.id][command.names[0]] == time) delete client.cooldowns[message.author.id][command.names[0]]
            }, command.cooldown)
        }
    } else if (command) {
        return message.reply({ embeds: [utils.embeds.error("Litties Boot trying to connect to a database. Try again later")]})
    }
}
