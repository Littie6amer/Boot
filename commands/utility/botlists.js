const utils = require('../../utils')
const d = utils.emojis.d; const b = utils.emojis.b
const {MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed} = require('discord.js')

module.exports = {
    name: "botlists",
    aka: ['tgg', 'dbl', 'discordbotlist', 'topgg', 'botlist'],
    description: "Get the botlist page for a bot.",
    args: " [Bot ID]",
    async run (toolbox) {
        const {message, client, args} = toolbox
        
        
        let user;
        if (args[0]) {
            try { user = client.users.cache.get(args[0].replaceAll('<', '').replaceAll('!', '').replaceAll('@', '').replaceAll('>', '')) } catch {}
        }
        
        if (!user) {
            const dropDown = []
            message.guild.members.cache.forEach(member => {
                if (dropDown.length < 25) {
                    if (member.user.bot) {
                        dropDown.push({label: `${member.user.username}`, value: member.user.id})
                    }
                }
            });
            const embed = await utils.embeds.helpEmbed(this, message, [" 789211373020250172"])
            const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('listSelect')
                        .setPlaceholder('Get the page for a bot in this sevrer...')
                        .addOptions(dropDown),
                );
            message.reply({embeds: [embed], ephemeral: true, components: [row]})
        } else {
            message.reply({embeds: [new MessageEmbed().setAuthor(`${user.username} [ #${user.discriminator} ]`).setDescription(`Click the buttons below to view the page\non ${user.username} for many botlists.`).addField('Please Note', 'If this bot doesn\'t have a page. nothing will show up.').setThumbnail(user.avatarURL()).setColor(0xbf943d)], components: [
                new MessageActionRow().addComponents(
                new MessageButton().setLabel('Top.gg').setURL(`https://top.gg/bot/${user.id}`).setStyle('LINK'), 
                new MessageButton().setLabel('Discord Bot List').setURL(`https://discordbotlist.com/bots/${user.id}`).setStyle('LINK'),
                new MessageButton().setLabel('Infinity Bot List').setURL(`https://ibl.rocks/bots/${user.id}`).setStyle('LINK'), 
                )
            ]})
        }
    }
}