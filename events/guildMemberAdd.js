const { MessageEmbed } = require("discord.js")
const utils = require("../utils")

module.exports = async (client, member) => {
    const bugReport = await client.guilds.cache.get("882345419852632114").invites.fetch()
    if (member.guild.id == "882345419852632114" && client.invites.bugReport < bugReport) {
        member.roles.add("919263466647343164")
        const embed = new MessageEmbed()
            .setColor(utils.colors.gold)
            .setAuthor('Welcome to error reports!', member.user.avatarURL())
            .setDescription("Please provide the steps that caused the bug!")
        client.channels.cache.get("882368457566486528").send(`${member} joined to report an error!`)
        client.invites.bugReport.uses++
        setTimeout(() =>
            client.channels.cache.get("919282562457808956").send({ content: `<@${member.id}>`, embeds: [embed] })
            , 5000)
    }
}