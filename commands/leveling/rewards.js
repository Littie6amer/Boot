const utils = require('../../utils')
const getColors = require('get-image-colors')
const guildProfileSc = require('../../schemas/guildProfile')
const { Command } = require('../../utils');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const command = module.exports = new Command()

command.create(["rewards", "r"])
    .setExecute(execute)

async function execute(toolbox) {
    const { message, args, client } = toolbox
    const { rbgToHex, findBrightestColor } = utils

    let user;

    if (args[0]) {
        try { user = await client.users.fetch(args[0]) } catch { }
    }

    if (message.mentions.members.first() && !user) {
        user = message.mentions.members.first().user
    }

    if (!user) {
        user = message.author
    }

    // const mentionedGuildProfile = await guildProfileSc.findOne({
    //     guildId: message.guild.id,
    //     userId: user.id
    // })

    const colors = await getColors(user.displayAvatarURL({ format: 'png' }))

    const components = [new MessageActionRow().addComponents([
        new MessageButton().setCustomId('rank:' + user.id).setEmoji('👤').setLabel('Rank').setStyle('SECONDARY'),
        new MessageButton().setCustomId('messages:' + user.id).setEmoji('✉️').setLabel('Activity').setStyle('SECONDARY'),
    ])]

    const embed = new MessageEmbed()
        .setAuthor(user.username, user.avatarURL())
        .setDescription(`:gift: This system needs to be added first!`)
        .setColor(findBrightestColor(colors).index > -1 ? rbgToHex(colors[findBrightestColor(colors).index]._rgb) : 0xbf943d)

    message.reply({ embeds: [embed], components })
}