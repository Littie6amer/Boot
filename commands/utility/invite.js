const utils = require('../../utils')
const d = utils.emojis.d; const b = utils.emojis.b
const {MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed} = require('discord.js')

module.exports = {
    name: "invite",
    aka: ['inv'],
    description: "Invite a bot!",
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
                        .setCustomId('invSelect')
                        .setPlaceholder('Invite a bot from this server...')
                        .addOptions(dropDown),
                );
            message.reply({embeds: [embed], ephemeral: true, components: [row]})
        } else {
            message.reply({embeds: [new MessageEmbed().setAuthor(`${user.username} [ #${user.discriminator} ]`).setDescription(`Click the buttons below to invite\n${user.username} to your server.`).addField('Please Note', 'If you give a bot you dont trust too many\npermissions, their stay there may go badly.').setThumbnail(user.avatarURL()).setColor(0xbf943d)], components: [
                new MessageActionRow().addComponents(
                new MessageButton().setLabel('No Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=2048&scope=bot`).setStyle('LINK'), 
                new MessageButton().setLabel('Member Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=378944&scope=bot`).setStyle('LINK')
                ),
                new MessageActionRow().addComponents(
                new MessageButton().setLabel('Mod Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=134597830&scope=bot`).setStyle('LINK'), 
                new MessageButton().setLabel('Admin Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=789211373020250172&scope=bot`).setStyle('LINK')
                )
            ]})
        }
    }
}