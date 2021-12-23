const { MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const utils = { Command } = require('../../utils');
const command = module.exports = new Command()

command.create(['invite', 'inv'], "Invite a bot to your server using its ID")
    .setExecute(execute)
    .addDropOption("invSelect:", [""], dropDownExecute, false)

async function execute(toolbox) {
    const { message, client, args } = toolbox

    let user;
    if (args[0]) {
        try { user = client.users.cache.get(args[0].replaceAll('<', '').replaceAll('!', '').replaceAll('@', '').replaceAll('>', '')) } catch { }
    }

    if (!user) {
        const dropDown = []
        message.guild.members.cache.forEach(member => {
            if (dropDown.length < 25) {
                if (member.user.bot) {
                    dropDown.push({ label: `${member.user.username}`, value: member.user.id })
                }
            }
        });
        const embed = await utils.embeds.simpleUsageEmbed(command, " [Bot ID]")
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('invSelect:' + message.author.id)
                    .setPlaceholder('Invite a bot from this server...')
                    .addOptions(dropDown),
            );
        message.reply({ embeds: [embed], ephemeral: true, components: [row] })
    } else {
        message.reply({
            embeds: [new MessageEmbed().setAuthor(`${user.username} [ #${user.discriminator} ]`).setDescription(`Click the buttons below to invite\n${user.username} to your server.`).addField('Please Note', 'If you give a bot you dont trust too many\npermissions, their stay there may go badly.').setThumbnail(user.avatarURL()).setColor(0xbf943d)], components: [
                new MessageActionRow().addComponents(
                    new MessageButton().setLabel('No Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=2048&scope=bot%20applications.commands`).setStyle('LINK'),
                    new MessageButton().setLabel('Member Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=378944&scope=bot%20applications.commands`).setStyle('LINK'),
                    new MessageButton().setLabel('Mod Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=134597830&scope=bot%20applications.commands`).setStyle('LINK'),
                    new MessageButton().setLabel('Admin Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=789211373020250172&scope=bot%20applications.commands`).setStyle('LINK')
                )
            ]
        })
    }
}

async function dropDownExecute(toolbox) {
    const { client } = toolbox
    const interaction = { message, customId, member, values } = toolbox.interaction
    let user;
    
    try { user = await client.users.cache.get(values[0]) } catch { }

    if (!customId.slice('invSelect:'.length) == member.id) return message.reply('<:redboot:902910668091576331> **Try running that command yourself!**')
    if (!user) return message.reply('<:redboot:902910668091576331> **That bot no longer exists!**')

    interaction.deferUpdate()
    message.edit({
        embeds: [new MessageEmbed().setAuthor(`${user.username} [ #${user.discriminator} ]`).setDescription(`Click the buttons below to invite\n${user.username} to your server.`).addField('Please Note', 'If you give a bot you dont trust too many\npermissions, their stay there may go badly.').setThumbnail(user.avatarURL()).setColor(0xbf943d)], components: [
            new MessageActionRow().addComponents(
                new MessageButton().setLabel('No Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=2048&scope=bot%20applications.commands`).setStyle('LINK'),
                new MessageButton().setLabel('Member Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=378944&scope=bot%20applications.commands`).setStyle('LINK'),
                new MessageButton().setLabel('Mod Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=134597830&scope=bot%20applications.commands`).setStyle('LINK'),
                new MessageButton().setLabel('Admin Perms').setURL(`https://discord.com/api/oauth2/authorize?client_id=${user.id}&permissions=789211373020250172&scope=bot%20applications.commands`).setStyle('LINK')
            )
        ]
    })

}