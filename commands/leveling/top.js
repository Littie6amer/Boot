const utils = require('../../utils')
const command = new utils.Command()
const guildProfileSc = require('../../schemas/guildProfile')
const { MessageEmbed, MessageFile } = require('discord.js')

command
    .create("top")
    .setExecute(execute)
    //.addButton("messages:", execute, false)
    .makeSlashCommand()

module.exports = command

async function execute(toolbox) {
    const { message, args, userGuildProfile } = toolbox
    if (!args[0] || !["messages", "levels"].includes(args[0].toLowerCase())) {
        const embed = await utils.embeds.simpleUsageEmbed(command, " [messages | levels]")
        return message.reply({ embeds: [embed] })
    }
    let users = (await guildProfileSc.find({
        guildId: message.guild.id,
    }))
        .filter(u => message.guild.members.cache.get(u.userId) && u[args[0] == "levels" ? "leveling" : "activity"][args[0] == "levels" ? "xp" : "overall"])
        .sort((a, b) => sortBy(a, b, args[0].toLowerCase()))
        .reverse()
        .slice(0, 10)

    //const components = []
    let { xp, level } = utils.leveling.parseXp(userGuildProfile.leveling.xp)
    let yourRankDisplay = args[0].toLowerCase() == "levels" ? `${level ? `Level ${level}, ` : ""}${xp}XP` : `${userGuildProfile.activity.overall.messages} messages`
    let rank = "00".slice(`${users.findIndex(u => u.userId == message.author.id) + 1}`.length) + (users.findIndex(u => u.userId == message.author.id) + 1)
    const embed = new MessageEmbed()
        .setAuthor({ name: message.guild.name+"\nShowing Top Members", iconURL: message.guild.iconURL() })
        .setDescription(
            users.map(u =>
                leaderboardPlace(message.guild.members.cache.get(u.userId).user, u, users.findIndex(i => i == u) + 1, args[0].toLowerCase())
            )
                .join("\n")
        )
        .addField("\u200b", `\`Rank #${rank}\`<:Blank1:801947188590411786>[${message.author.username}](https://discord.com/users/${message.author.id}) - ${yourRankDisplay}`)
        .setColor("2f3136")
    message.channel.send({ embeds: [embed] })
}

function sortBy(a, b, type) {
    return type == "levels" ? (a.leveling.xp - b.leveling.xp) : (a.activity.overall.messages - b.activity.overall.messages)
}

function leaderboardPlace(user, userData, rank, type) {
    let { xp, level } = utils.leveling.parseXp(userData.leveling.xp)
    let display = type == "levels" ? `${level ? `Level **${level}**, ` : ""}${xp}XP` : `**${userData.activity.overall.messages}** msgs`
    return `\`Rank #${"00".slice(rank.toString().length) + rank}\`<:Blank1:801947188590411786>[${user.username}](https://discord.com/users/${user.id}) - ${display}`
}