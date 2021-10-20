const utils = require('../../utils')
const d = utils.emojis.d; const b = utils.emojis.b
const guildProfileSc = require('../../schemas/guildProfile')
const {MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed} = require('discord.js');

module.exports = {
    name: "triggerlevelup",
    aka: [],
    async run (toolbox) {
        const {message, client, userGuildProfile} = toolbox
        userGuildProfile.leveling.xp = 49
        userGuildProfile.leveling.lastXpTimestamp = 0;
        await guildProfileSc.updateOne({
            guildId: message.guild.id,
            userId: message.author.id,
        }, userGuildProfile)

        message.channel.send(`Level up will be triggered`)
    }
}