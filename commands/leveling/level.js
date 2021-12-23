const utils = require('../../utils')
const command = new utils.Command()
const Canvas = require('canvas');
Canvas.registerFont('fonts/OpenSans-Bold.ttf', { family: 'Open Sans Bold' })
const getColors = require('get-image-colors')
const guildProfileSc = require('../../schemas/guildProfile')
const { MessageEmbed, MessageAttachment, MessageActionRow, MessageButton, Interaction } = require('discord.js');

command.create(["rank", "level", "l"])
    .setExecute(execute)
    .addButton("rank:", execute, false)

module.exports = command

async function execute(toolbox) {
    const { message, args, client, guildData, interaction } = toolbox

    const values = interaction?.customId.slice("rank:".length).split('/#~~#/')
    if (values && (values[0] != interaction.member.id)) return

    if (!guildData.leveling.enabled) {
        const embed = new MessageEmbed()
        .setAuthor(`Leveling - ${message.guild.name}`, message.guild.iconURL())
        .setDescription('<a:redcross:868671069786099752> Leveling module disabled!')
        .setColor('RED')
        return message.reply({ embeds: [embed] })
    }

    const { rbgToHex, findBrightestColor } = utils
    const { resources, parseXp, applyBackground, roundedRect, roundedClip } = utils.leveling

    const config = {
        "useSolidColorBackground": false,
        "showGuildName": false,
        "showUserAvatar": true
    }

    let user, member;

    if (args && args[0]) {
        try { user = await client.users.fetch(args[0]) } catch { }
        if (user && message.guild.members.cache.get(user.id)) member = message.guild.members.cache.get(user.id)
    }

    if (message && message.mentions.members.first() && !user) {
        user = message.mentions.members.first().user
        member = message.mentions.members.first()
    }

    if (!user) {
        user = message ? message.author : interaction.member.user
        member = message ? message.member : interaction.member
    }

    const mentionedGuildProfile = await guildProfileSc.findOne({
        guildId: message ? message.guild.id : interaction.guild.id,
        userId: user.id
    })

    let { level, xp, xpAmounts } = parseXp(mentionedGuildProfile?.leveling.xp || 0)

    const colors = await getColors(user.displayAvatarURL({ format: 'png' }))

    const canvas = Canvas.createCanvas(560, config.showGuildName ? 200 : 155)
    const context = canvas.getContext('2d')

    // drawing card background
    const provided = config.useSolidColorBackground ? resources.solidBackgroundColors : resources.backgroundImages
    await applyBackground(canvas, context, provided[Math.floor(Math.random() * provided.length)])

    // background overlay
    context.fillStyle = "#010023AA"
    context.fillRect(0, 0, canvas.width, canvas.height)

    // guild text
    context.fillStyle = "#fff"
    context.font = '25px Open Sans Bold'
    context.textAlign = "center"
    if (config.showGuildName) context.fillText(message.guild.name, 280, 35)
    context.textAlign = "left"

    // username text
    context.fillStyle = "#fff"
    context.font = '20px Open Sans Bold'
    context.fillText(user.username.toUpperCase(), config.showUserAvatar ? 80 : 20, config.showGuildName ? 68 : 38)

    // role text
    context.fillStyle = findBrightestColor(colors).index > -1 ? rbgToHex(colors[findBrightestColor(colors).index]._rgb) : "#ffffff"
    context.fillText("NO REWARD YET", config.showUserAvatar ? 80 : 20, config.showGuildName ? 92 : 62)

    // progress background color
    context.fillStyle = "#000000AA"
    roundedRect(context, 20, config.showGuildName ? 120 : 85, 512, 18, 10)

    // progress bar 
    context.fillStyle = findBrightestColor(colors).index > -1 ? rbgToHex(colors[findBrightestColor(colors).index]._rgb) : "#ffffff"
    if (xp) roundedRect(context, 20, config.showGuildName ? 120 : 85, (xp / xpAmounts[0]) * 520, 18, 10)

    // level text
    context.textAlign = "right"
    context.fillStyle = "#fff"
    context.font = '20px Open Sans Bold'
    context.fillText(`LEVEL ${level || 0}`, 535, config.showGuildName ? 92 : 62)

    // xp text
    context.fillStyle = "#fff"
    context.font = '20px Open Sans Bold'
    context.fillText(`${xp || 0} / ${xpAmounts[0]} XP`, 535, config.showGuildName ? 68 : 38)

    // message text
    context.textAlign = "center"
    context.fillStyle = "#fff"
    context.font = '20px Open Sans Bold'
    context.fillText(`${mentionedGuildProfile?.activity?.overall?.messages || 0} MESSAGES`, canvas.width / 2, config.showGuildName ? 185 : 135)

    // avatar drawing
    const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'png' }));
    roundedClip(context, 20, config.showGuildName ? 50 : 20, 45, 45, 5);
    if (config.showUserAvatar) context.drawImage(avatar, 20, config.showGuildName ? 50 : 20, 45, 45);

    const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png');

    const components = [new MessageActionRow().addComponents([
        new MessageButton().setCustomId('messages:' + user.id).setEmoji('✉️').setLabel('Activity').setStyle('SECONDARY'),
        new MessageButton().setCustomId('rewards:' + user.id).setEmoji('🎁').setLabel('Rewards').setStyle('SECONDARY'),
    ])]

    if (interaction?.message) {
        interaction.deferUpdate()
        interaction.message.edit({ files: [attachment], components, embeds: [] })
    } else {
        message.reply({ files: [attachment], components })
    }
}