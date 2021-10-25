const utils = require('../../utils')
const d = utils.emojis.d; const b = utils.emojis.b
const Canvas = require('canvas');
Canvas.registerFont('fonts/OpenSans-Bold.ttf', { family: 'Open Sans Bold' })
const getColors = require('get-image-colors')
const guildProfileSc = require('../../schemas/guildProfile')
const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = {
    name: "rank",
    aka: ['level', 'l'],
    config: {
        "useSolidColorBackground": false,
        "showGuildName": false,
        "showUserAvatar": true,
        "embed": true
    },
    async run(toolbox) {
        const { message, args, client } = toolbox
        const { rbgToHex, findBrightestColor } = toolbox.utils
        const { resources, parseXp, applyBackground, roundedRect, roundedClip } = toolbox.utils.leveling

        let user;
        
        if (args[0]) {
            try { user = await client.users.fetch(args[0]) } catch {}
        }
        
        if (message.mentions.members.first() && !user) {
            user = message.mentions.members.first().user
        }
        
        if (!user) {
            user = message.author
        }
        
        const mentionedGuildProfile = await guildProfileSc.findOne({
            guildId: message.guild.id,
            userId: user.id
        })
        
        let { level, xp, xpAmounts } = parseXp(mentionedGuildProfile?.leveling.xp||0)

        const colors = await getColors(user.displayAvatarURL({ format: 'png' }))

        const canvas = Canvas.createCanvas(560, this.config.showGuildName ? 200 : 155)
        const context = canvas.getContext('2d')

        // drawing card background
        const provided = this.config.useSolidColorBackground ? resources.solidBackgroundColors : resources.backgroundImages
        await applyBackground(canvas, context, provided[Math.floor(Math.random() * provided.length)])

        // guild text box background
        context.fillStyle = "#000000cc"
        if (this.config.showGuildName ) context.fillRect(10, 10, 540, 35)

        // guild text
        context.fillStyle = "#fff"
        context.font = '25px Open Sans Bold'
        context.textAlign = "center"
        if (this.config.showGuildName ) context.fillText(message.guild.name, 280, 35)
        context.textAlign = "left"

        // profile card background
        context.fillStyle = "#000000cc"
        roundedRect(context, 10, this.config.showGuildName  ? 50 : 10, 540, 140, 15)

        // username text
        context.fillStyle = "#fff"
        context.font = '20px Open Sans Bold'
        context.fillText(user.username, this.config.showUserAvatar ? 80 : 20, this.config.showGuildName  ? 90 : 55)

        // progress bar outline
        context.fillStyle = findBrightestColor(colors).index > -1 ? rbgToHex(colors[findBrightestColor(colors).index]._rgb) : "#ffffff"
        roundedRect(context, 20, this.config.showGuildName  ? 120 : 85, 520, 18, 9)

        // progress background color
        context.fillStyle = "#000000"
        roundedRect(context, 21, this.config.showGuildName  ? 121 : 86, 518, 16, 9)

        // progress bar 
        context.fillStyle = findBrightestColor(colors).index > -1 ? rbgToHex(colors[findBrightestColor(colors).index]._rgb) : "#ffffff"
        if (xp) roundedRect(context, 21, this.config.showGuildName  ? 121 : 86, (xp / xpAmounts[0]) * 518, 16, 9)

        // level text
        context.fillStyle = "#fff"
        context.font = '18px Open Sans Bold'
        context.fillText(`Level ${level}`, 20, this.config.showGuildName  ? 170 : 135)

        // xp text
        context.fillStyle = "#fff"
        context.font = '18px Open Sans Bold'
        context.textAlign = "right"
        context.fillText(`${xp} / ${xpAmounts[0]} XP`, 535, this.config.showGuildName  ? 170 : 135)

        // avatar drawing
        const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'jpg' }));
        roundedClip(context, 20, this.config.showGuildName  ? 60 : 25, 45, 45, 15);
        if (this.config.showUserAvatar) context.drawImage(avatar, 20, this.config.showGuildName  ? 60 : 25, 45, 45);

        const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png');

        const embed = new MessageEmbed()
        .setAuthor(message.guild.name, message.guild.iconURL())
        .setDescription('View message stats with `!!activity`')
        .setImage('attachment://profile-image.png')
        .setColor(findBrightestColor(colors).index > -1 ? rbgToHex(colors[findBrightestColor(colors).index]._rgb) : 0xbf943d)
        message.reply({ files: [attachment], embeds: [embed] })
    }
}