module.exports = (client) => {
    console.log(`[${client.user.username}]: Ready!`)
    console.log(`[${client.user.username}]: Bot is in ${client.guilds.cache.size} guilds!`)
}