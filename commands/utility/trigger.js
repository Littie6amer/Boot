const utils = require('../../utils')
const command = new utils.Command()
const guildProfileSc = require('../../schemas/guildProfile')
const { MessageEmbed } = require('discord.js')
const guildData = require('../../schemas/guildData')

command
    .create(["trigger", "t"], "Manage your guild, your user data or just test out things!")
    .setExecute(execute)
    .restrict()

module.exports = command

async function execute(toolbox) {
    const { message, client, userGuildProfile, args } = toolbox
    switch (args[0]?.toLowerCase()) {
        case undefined:
            {
                const embed = await utils.embeds.subCommandList(command, { "leveling": ["increase-xp", "set-xp", "reset-xp", "reset-user-data"] })
                message.channel.send({ embeds: [embed] })
            }
            break
        case "increase-xp":
            {
                let xp = args[1]
                if (!xp || isNaN(xp)) xp = utils.leveling.getRandomXp()
                userGuildProfile.leveling.xp += xp
                userGuildProfile.leveling.lastXpTimestamp = 0;
                await guildProfileSc.updateOne({
                    guildId: message.guild.id,
                    userId: message.author.id,
                }, userGuildProfile)

                message.channel.send(`:gear: Increased your XP by **${xp}**`)
            }
            break
        case "set-xp":
            {
                let xp = args[1]
                if (!xp || isNaN(xp)) xp = utils.leveling.getRandomXp()
                userGuildProfile.leveling.xp = xp
                userGuildProfile.leveling.lastXpTimestamp = 0;
                await guildProfileSc.updateOne({
                    guildId: message.guild.id,
                    userId: message.author.id,
                }, userGuildProfile)

                message.channel.send(`:gear: Set your XP to **${xp}**`)
            }
            break
        case "reset-xp":
            {
                userGuildProfile.leveling.xp = 0
                userGuildProfile.leveling.lastXpTimestamp = 0;
                await guildProfileSc.updateOne({
                    guildId: message.guild.id,
                    userId: message.author.id,
                }, userGuildProfile)

                message.channel.send(`:gear: Set your XP to **0**`)
            }
            break
        case "reset-user-data":
            {
                await guildProfileSc.deleteOne({
                    guildId: message.guild.id,
                    userId: message.author.id,
                })

                message.channel.send(`:gear: Userinfo **reset**`)
            }
            break
        case "reset-guild-data":
            {
                await guildData.deleteOne({
                    guildId: message.guild.id,
                })

                message.channel.send(`:gear: Guildinfo **reset**`)
            }
            break
        case "leave":
            {
                let guild = args[1] ? client.guilds.cache.get(args[1]) : message.guild
                if (!guild) {
                    guild = client.guilds.cache.find(g => g.name.toLowerCase().startsWith(args[1].toLowerCase()))
                }

                if (guild) {
                    let owner = await guild.fetchOwner()
                    await message.channel.send(`Left **${guild.name}**, owned by **${owner.user.tag}**`)
                    guild.leave()
                } else {
                    message.channel.send(`Found 0 servers`)
                }
            }
            break
        case "list-guilds":
            {
                let description = (await client.shard.broadcastEval(s =>
                    s.guilds.cache.map(g => `**${g.name}:** ${g.memberCount} members (\`${g.id}\`)`)
                )).map(c => c.join("\n")).join("\n")
                const embed = new MessageEmbed()
                    .setColor(utils.colors.gold)
                    .setDescription(description)
                message.channel.send({ embeds: [embed] })
            }
            break
    }
}