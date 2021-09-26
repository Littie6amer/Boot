const { prefixes } = require('../data/config.json')
const {MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed, Interaction} = require('discord.js')

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
        let user;
        try {user = await client.users.fetch(interaction.values[0])} catch {}
        if (!user) return interaction.reply({ephemeral: true, embeds: [new MessageEmbed().setAuthor('That bot no longer exists!').setColor(0xbf943d)]})
        interaction.reply({ephemeral: true, embeds: [new MessageEmbed().setAuthor(`${user.username} [ #${user.discriminator} ]`).setDescription(`Click the buttons below to invite\n${user.username} to your server.`).addField('Please Note', 'If you give a bot you dont trust too many\npermissions, their stay there may go badly.').setThumbnail(user.avatarURL()).setColor(0xbf943d)], components: [
            new MessageActionRow().addComponents(
            new MessageButton().setLabel('No Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=2048&scope=bot`).setStyle('LINK'), 
            new MessageButton().setLabel('Member Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=378944&scope=bot`).setStyle('LINK')
            ),
            new MessageActionRow().addComponents(
            new MessageButton().setLabel('Mod Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=134597830&scope=bot`).setStyle('LINK'), 
            new MessageButton().setLabel('Admin Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=789211373020250172&scope=bot`).setStyle('LINK')
            )
        ]});
    }

    if (interaction.customId == 'listSelect') {
        let user;
        try {user = await client.users.fetch(interaction.values[0])} catch {}
        if (!user) return;
        interaction.reply({ephemeral: true, embeds: [new MessageEmbed().setAuthor(`${user.username} [ #${user.discriminator} ]`).setDescription(`Click the buttons below to view the page\non ${user.username} for many botlists.`).addField('Please Note', 'If this bot doesn\'t have a page. nothing will show up.').setThumbnail(user.avatarURL()).setColor(0xbf943d)], components: [
            new MessageActionRow().addComponents(
            new MessageButton().setLabel('Top.gg').setURL(`https://top.gg/bot/${user.id}`).setStyle('LINK'), 
            new MessageButton().setLabel('Discord Bot List').setURL(`https://discordbotlist.com/bots/${user.id}`).setStyle('LINK'),
            new MessageButton().setLabel('Infinity Bot List').setURL(`https://ibl.rocks/bots/${user.id}`).setStyle('LINK'), 
            )
        ]})
    }

    if (interaction.customId == 'roleList') {
        interaction.message.edit({components: interaction.message.components})
        let role = interaction.message.guild.roles.cache.get(interaction.values[0])
        if (!interaction.message.guild.me.permissions.has('MANAGE_ROLES')) return interaction.reply({ephemeral: true, content: `I am unable to add role **${role.name}**, check my permissions!`});
        if (interaction.message.guild.me.roles.highest.position <= role.position) return interaction.reply({ephemeral: true, content: `I am unable to add role **${role.name}**, check the position of my highest role!`});
        if (role) {
            if (interaction.member.roles.cache.get(role.id)) {
                interaction.member.roles.remove(role.id)
                interaction.reply({ephemeral: true, content: `**${role.name}** role was taken from you.`})
            } else {
                interaction.member.roles.add(role.id)
                interaction.reply({ephemeral: true, content: `You were given **${role.name}** role`})
            }
        }
    }

}