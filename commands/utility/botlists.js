const { MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const { Command } = require('../../utils')
const utils = require('../../utils')
const command = module.exports = new Command()

command.create(['botlists', 'tgg', 'dbl', 'discordbotlist', 'topgg', 'botlist'], "Get the botlist page for a bot using its ID")
    .setExecute(execute)
    .addDropOption("botList:", [""], dropDownExecute, false)

async function execute(toolbox) {
    const { message, client, args } = toolbox

    let user;
    if (args[0]) {
        try { user = await client.users.fetch(args[0].replaceAll('<', '').replaceAll('!', '').replaceAll('@', '').replaceAll('>', '')) } catch { }
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
                    .setCustomId('botList:' + message.author.id)
                    .setPlaceholder('Get the page for a bot in this sevrer...')
                    .addOptions(dropDown),
            );
        message.reply({ embeds: [embed], ephemeral: true, components: [row] })
    } else {
        message.reply({
            embeds: [new MessageEmbed().setAuthor(`${user.username} [ #${user.discriminator} ]`).setDescription(`Click the buttons below to view the page\non ${user.username} for many botlists.`).addField('Please Note', 'If this bot doesn\'t have a page. nothing will show up.').setThumbnail(user.avatarURL()).setColor(0xbf943d)], components: [
                new MessageActionRow().addComponents(
                    new MessageButton().setLabel('Top.gg').setURL(`https://top.gg/bot/${user.id}`).setStyle('LINK'),
                    new MessageButton().setLabel('Discord Bot List').setURL(`https://discordbotlist.com/bots/${user.id}`).setStyle('LINK'),
                    new MessageButton().setLabel('Infinity Bot List').setURL(`https://infinitybots.gg/bots/${user.id}`).setStyle('LINK'),
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

    if (!customId.slice('botList:'.length) == member.id) return message.reply('<:redboot:902910668091576331> **Try running that command yourself!**')
    if (!user) return message.reply('<:redboot:902910668091576331> **That bot no longer exists!**')

    interaction.deferUpdate()
    message.edit({
        embeds: [new MessageEmbed().setAuthor(`${user.username} [ #${user.discriminator} ]`).setDescription(`Click the buttons below to view the page\non ${user.username} for many botlists.`).addField('Please Note', 'If this bot doesn\'t have a page. nothing will show up.').setThumbnail(user.avatarURL()).setColor(0xbf943d)], components: [
            new MessageActionRow().addComponents(
                new MessageButton().setLabel('Top.gg').setURL(`https://top.gg/bot/${user.id}`).setStyle('LINK'),
                new MessageButton().setLabel('Discord Bot List').setURL(`https://discordbotlist.com/bots/${user.id}`).setStyle('LINK'),
                new MessageButton().setLabel('Infinity Bot List').setURL(`https://infinitybots.gg/bots/${user.id}`).setStyle('LINK'),
            )
        ]
    })

}