const { prefixes } = require('../data/config.json')
const {MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed} = require('discord.js')

module.exports = async (client, interaction) => {

    if (interaction.commandName === 'introSelect') {

        if (interaction.values.includes('introP1')) {

        }

        if (interaction.values.includes('introP2')) {
            
        }

        if (interaction.values.includes('introP3')) {
            
        }

    }
    
    if (interaction.customId == 'invSelect') {
        interaction.deferUpdate();
        const channel = interaction.message.channel
        if (!channel) return
        const m = await channel.messages.fetch(interaction.message.id)
            
        let user;
        try {user = await client.users.fetch(interaction.values[0])} catch {}
        if (!user) return m.edit({embeds: [new MessageEmbed().setAuthor('That bot no longer exists!').setColor(0xbf943d)]})
        m.edit({embeds: [new MessageEmbed().setAuthor(`${user.username} [ #${user.discriminator} ]`).setDescription(`Click the buttons below to invite\n${user.username} to your server.`).addField('Please Note', 'If you give a bot you dont trust too many\npermissions, their stay there may go badly.').setThumbnail(user.avatarURL()).setColor(0xbf943d)], components: [
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

    if (interaction.customId == 'listSelect') {
        interaction.deferUpdate();
        const channel = interaction.message.channel
        if (!channel) return
        const m = await channel.messages.fetch(interaction.message.id)
            
        let user;
        try {user = await client.users.fetch(interaction.values[0])} catch {}
        if (!user) return m.edit({embeds: [new MessageEmbed().setAuthor('That bot no longer exists!').setColor(0xbf943d)]})
        m.edit({embeds: [new MessageEmbed().setAuthor(`${user.username} [ #${user.discriminator} ]`).setDescription(`Click the buttons below to view the page\non ${user.username} for many botlists.`).addField('Please Note', 'If this bot doesn\'t have a page. nothing will show up.').setThumbnail(user.avatarURL()).setColor(0xbf943d)], components: [
            new MessageActionRow().addComponents(
            new MessageButton().setLabel('Top.gg').setURL(`https://top.gg/bot/${user.id}`).setStyle('LINK'), 
            new MessageButton().setLabel('Discord Bot List').setURL(`https://discordbotlist.com/bots/${user.id}`).setStyle('LINK'),
            new MessageButton().setLabel('Infinity Bot List').setURL(`https://ibl.rocks/bots/${user.id}`).setStyle('LINK'), 
            )
        ]})
    }

}