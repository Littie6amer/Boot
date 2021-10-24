const utils = require('../../utils')
const d = utils.emojis.d; const b = utils.emojis.b
const guildProfileSc = require('../../schemas/guildProfile')
const { MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');

module.exports = {
    name: "trigger",
    aka: [],
    async run(toolbox) {
        const { message, client, userGuildProfile, args } = toolbox
        switch (args[0].toLowerCase()) {
            case undefined:
                message.channel.send('Ill go do that when pigs fly!')
                break
            case "levelup":
                userGuildProfile.leveling.xp = 49
                userGuildProfile.leveling.lastXpTimestamp = 0;
                await guildProfileSc.updateOne({
                    guildId: message.guild.id,
                    userId: message.author.id,
                }, userGuildProfile)

                message.channel.send(`Level up will be triggered`)
                break
            case "resetuser":
                await guildProfileSc.deleteOne({
                    guildId: message.guild.id,
                    userId: message.author.id,
                })

                message.channel.send(`Userinfo reset!`)
                break
        }
    }
}