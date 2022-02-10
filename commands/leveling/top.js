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
    const { message } = toolbox
    let users = (await guildProfileSc.find({
        guildId: message.guild.id,
    }))
        .filter(u => message.guild.members.cache.get(u.userId) && u.leveling.xp)
        .sort((a, b) => sortBy(a, b, "xp"))
        .reverse()

    //const components = []
    const embed = new MessageEmbed()
        .setDescription(users.map(u => leaderboardPlace(message.guild.members.cache.get(u.userId).user, u, users.findIndex(i => i == u) + 1, "xp")).join("\n"))
        .setColor("2f3136");
    message.channel.send({
        embeds: [embed]
    })
}

function sortBy (a, b, type) {
    return  type == "xp" ? (a.leveling.xp - b.leveling.xp) : (a.activity.overall.messages - b.activity.overall.messages)
}

function leaderboardPlace(user, userData, rank, type) {
    let { xp, level } = utils.leveling.parseXp(userData.leveling.xp)
    let display = type == "xp" ? `${level ? `Level ${level}, ` : ""}${xp}XP` : `${userData.activity.overall.messages} messages`
    return `\`Rank #${rank}\`<:Blank1:801947188590411786>**${user.tag}** ${display}`
}