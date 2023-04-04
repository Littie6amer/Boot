const utils = require('../../utils')
const command = new utils.Command()
const Canvas = require('canvas');
Canvas.registerFont('fonts/OpenSans-Bold.ttf', { family: 'Open Sans Bold' })
const getColors = require('get-image-colors')
const guildProfileSc = require('../../schemas/guildProfile')
const { MessageEmbed, MessageAttachment, MessageActionRow, MessageButton, Interaction } = require('discord.js');
const contrast = require('contrast')

command.create(["rank", "level", "l"])
    .setExecute(execute)
    // .setPreviewExecute(previewExecute)
    .addButton("rank:", execute, false)
    .makeSlashCommand()

module.exports = command

async function execute(toolbox) {
    const { message, args, client, guildData, interaction } = toolbox

    const values = interaction?.customId.slice("rank:".length).split('/#~~#/')
    if (values && (values[1] != interaction.member.id)) return

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
        "showGuildName": false,
        "showUserAvatar": true
    }

    let user, member;

    if (args && args[0]) {
        try { user = await client.users.fetch(args[0], { force: true }) } catch { }
        if (user && message.guild.members.cache.get(user.id)) member = message.guild.members.cache.get(user.id)
        //if (user) user = await user.fetch({ force: true })
    }

    if (values && values[0]) {
        try { user = await client.users.fetch(values[0], { force: true }) } catch { }
        if (user && message.guild.members.cache.get(user.id)) member = message.guild.members.cache.get(user.id)
        //if (user) user = await user.fetch({ force: true })
    }


    if (message && message.mentions.members.first() && !user) {
        user = await message.mentions.members.first().user.fetch({ force: true })
        member = message.mentions.members.first()
    }

    if (!user) {
        user = message ? await message.author.fetch({ force: true }) : await interaction.member.user.fetch({ force: true })
        member = message ? message.member : interaction.member
    }

    const mentionedGuildProfile = await guildProfileSc.findOne({
        guildId: message ? message.guild.id : interaction.guild.id,
        userId: user.id
    })

    let { level, xp, xpAmounts } = parseXp(mentionedGuildProfile?.leveling.xp || 0)

    const colors = await getColors(user.displayAvatarURL({ format: 'png' }))

    const canvas = Canvas.createCanvas(560, config.showGuildName ? 200 : 155)
    const context = canvas.getContext('2d');

    let statText = { y: config.showGuildName ? 120 : 95 }
    let progressBar = { y: config.showGuildName ? 185 : 115, x: 20, width: 520 }
    let profile = { y: config.showGuildName ? 50 : 20 }

    if (message.author.banner) {
        let background = await Canvas.loadImage(user.bannerURL({ format: "png" }))
        context.drawImage(background, 0, 0, canvas.width, canvas.height)
        context.fillStyle = "#000000AA"
        context.fillRect(0, 0, canvas.width, canvas.height)
    } else {
        // await applyBackground(canvas, context, "https://media.discordapp.net/attachments/801513138398298163/961308073308340305/unknown.png?width=265&height=79")
        // let background = await Canvas.loadImage("https://cdn.discordapp.com/attachments/801524339265503294/925153367263703110/profile-image.png")
        // context.drawImage(background, 0, 0, canvas.width, canvas.height)
        context.fillStyle = "#202225"
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    // guild text
    context.fillStyle = "#fff"
    context.font = '25px Open Sans Bold'
    context.textAlign = "center"
    if (config.showGuildName) context.fillText(message.guild.name, 280, 35)
    context.textAlign = "left"

    // username text
    context.fillStyle = "#fff"
    context.font = '20px Open Sans Bold'
    context.fillText(user.username, config.showUserAvatar ? 80 : 20, config.showGuildName ? 80 : 50)
    let usernameText = context.measureText(user.username).width

    // tag text 
    context.font = '18px Open Sans Bold'
    context.fillStyle = findBrightestColor(colors).index > -1 ? rbgToHex(colors[findBrightestColor(colors).index]._rgb) : "#ffffff"
    context.fillText("#" + user.discriminator, (config.showUserAvatar ? 85 : 25) + usernameText, config.showGuildName ? 80 : 50)

    // progress background color
    context.fillStyle = findBrightestColor(colors).index > -1 ? rbgToHex(colors[findBrightestColor(colors).index]._rgb) : "#ffffff"
    roundedRect(context, progressBar.x, progressBar.y, progressBar.width, 18, 0)
    context.fillStyle = "#000000AA"
    roundedRect(context, progressBar.x, progressBar.y, progressBar.width, 18, 0)

    // progress bar 
    context.fillStyle = findBrightestColor(colors).index > -1 ? rbgToHex(colors[findBrightestColor(colors).index]._rgb) : "#ffffff"
    if (xp) roundedRect(context, progressBar.x, progressBar.y, (xp / xpAmounts[0]) * progressBar.width, 18, 0)

    // level text
    context.textAlign = "right"
    context.fillStyle = "#fff"
    context.font = '18px Open Sans Bold'
    context.fillText(`Level ${level || 0}`, 540, statText.y)

    // xp text
    context.textAlign = "left"
    context.fillStyle = "#fff"
    context.font = '18px Open Sans Bold'
    context.fillText(`${xp || 0} / ${xpAmounts[0]} XP`, 20, statText.y)

    // message text
    context.textAlign = "center"
    context.fillStyle = "#fff"
    context.font = '18px Open Sans Bold'
    context.fillText(`${mentionedGuildProfile?.activity?.overall?.messages || 0} Messages`, canvas.width / 2, statText.y)

    // avatar drawing
    const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'png' }));
    roundedClip(context, 20, profile.y, 45, 45, 5);
    if (config.showUserAvatar) context.drawImage(avatar, 20, profile.y, 45, 45);

    const attachment = new MessageAttachment(canvas.toBuffer(), `${user.username}-profile.png`);

    let components = []

    if (interaction?.message) {
        interaction.deferUpdate()
        interaction.message.edit({ files: [attachment], components, embeds: [] }).then(m => {
            components = [new MessageActionRow().addComponents([
                new MessageButton().setCustomId('messages:' + user.id + "/#~~#/" + interaction.member.id).setEmoji('✉️').setLabel('Activity').setStyle('SECONDARY'),
                new MessageButton().setURL(m.attachments.first().url).setStyle('LINK').setLabel("Image Url"),
            ])]
            m.edit({ components })
        })
    } else {
        message.reply({ files: [attachment], components }).then(m => {
            components = [new MessageActionRow().addComponents([
                new MessageButton().setCustomId('messages:' + user.id + "/#~~#/" + message.author.id).setEmoji('✉️').setLabel('Activity').setStyle('SECONDARY'),
                new MessageButton().setURL(m.attachments.first().url).setStyle('LINK').setLabel("Image Url"),
            ])]
            m.edit({ components })
        })
    }
}

async function previewExecute(toolbox) {
    const { message, args, client, guildData, interaction } = toolbox

    const values = interaction?.customId.slice("rank:".length).split('/#~~#/')
    if (values && (values[1] != interaction.member.id)) return

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
        "showGuildName": false,
        "showUserAvatar": true
    }

    let user, member;

    if (args && args[0]) {
        try { user = await client.users.fetch(args[0], { force: true }) } catch { }
        if (user && message.guild.members.cache.get(user.id)) member = message.guild.members.cache.get(user.id)
        //if (user) user = await user.fetch({ force: true })
    }


    if (message && message.mentions.members.first() && !user) {
        user = await message.mentions.members.first().user.fetch({ force: true })
        member = message.mentions.members.first()
    }

    if (!user) {
        user = message ? await message.author.fetch({ force: true }) : await interaction.member.user.fetch({ force: true })
        member = message ? message.member : interaction.member
    }

    const mentionedGuildProfile = await guildProfileSc.findOne({
        guildId: message ? message.guild.id : interaction.guild.id,
        userId: user.id
    })

    let { level, xp, xpAmounts } = parseXp(mentionedGuildProfile?.leveling.xp || 0)

    const colors = await getColors(user.displayAvatarURL({ format: 'png' }))

    const canvas = Canvas.createCanvas(560, 160)
    const context = canvas.getContext('2d');

    let statText = { y: 108 }
    let progressBar = { y: 85, x: 5, width: 550 }
    let profile = { y: config.showGuildName ? 50 : 20 }

    const themecolor = findBrightestColor(colors).index > -1 ? rbgToHex(colors[findBrightestColor(colors).index]._rgb) : "#ffffff"
    const theme = contrast(themecolor)

    if (user.banner) {
        let background = await Canvas.loadImage(user.bannerURL({ format: "png" }))
        context.drawImage(background, 0, 0, canvas.width, canvas.height)
        // context.fillStyle = "#000000AA"
        // context.fillRect(0, 0, canvas.width, canvas.height)
    } else {
        // await applyBackground(canvas, context, "https://media.discordapp.net/attachments/801513138398298163/961308073308340305/unknown.png?width=265&height=79")
        // let background = await Canvas.loadImage("https://cdn.discordapp.com/attachments/801524339265503294/925153367263703110/profile-image.png")
        // context.drawImage(background, 0, 0, canvas.width, canvas.height)
        context.fillStyle = themecolor
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    context.fillStyle = (theme == "light") ? "#000000AA" : "#FFFFFFAA"
    roundedRect(context, 5, 5, canvas.width-10, 75, 10)

    // guild text
    context.fillStyle = "#fff"
    context.font = '25px Open Sans Bold'
    context.textAlign = "center"
    if (config.showGuildName) context.fillText(message.guild.name, 280, 35)
    context.textAlign = "left"

    // username text
    context.fillStyle = (theme == "light") ? "#fff" : "#000"
    context.font = '25px Open Sans Bold'
    context.fillText(user.username, config.showUserAvatar ? 80 : 20, config.showGuildName ? 80 : 50)
    let usernameText = context.measureText(user.username).width

    // tag text 
    context.font = '20px Open Sans Bold'
    context.fillStyle = themecolor
    context.fillText("#" + user.discriminator, (config.showUserAvatar ? 85 : 25) + usernameText, config.showGuildName ? 80 : 50)

    // progress background color
    // context.fillStyle = findBrightestColor(colors).index > -1 ? rbgToHex(colors[findBrightestColor(colors).index]._rgb) : "#ffffff"
    // roundedRect(context, progressBar.x, progressBar.y, progressBar.width, 30, 5)
    context.fillStyle = (theme == "light") ? "#000000AA" : "#FFFFFFAA"
    roundedRect(context, progressBar.x, progressBar.y, progressBar.width, 70, 5)

    // progress bar 
    context.fillStyle = themecolor
    if (xp) roundedRect(context, progressBar.x+2.5, progressBar.y+2.5, (xp / xpAmounts[0]) * progressBar.width-5, 30, 5)
    roundedRect(context, progressBar.x+2.5, progressBar.y+37.5, progressBar.width-5, 30, 5)

    // context.fillStyle = "#000000AA"
    // roundedRect(context, progressBar.x, progressBar.y+35, progressBar.width, 30, 5)

    // progress bar 
    // context.fillStyle = findBrightestColor(colors).index > -1 ? rbgToHex(colors[findBrightestColor(colors).index]._rgb) : "#ffffff"
    // if (xp) roundedRect(context, progressBar.x+2.5, progressBar.y+37.5, progressBar.width-5, 30-5, 5)
    // level text
    context.textAlign = "center"
    context.fillStyle = (theme == "light") ? "#000" : "#fff"
    context.font = '18px Open Sans Bold'
    context.fillText(`Level ${level || 0}`, canvas.width / 2, progressBar.y+60)

    // xp text
    context.font = '18px Open Sans Bold'
    console.log(context.measureText(`${xp || 0} / ${xpAmounts[0]} XP`).width, (xp / xpAmounts[0]) * progressBar.width)
    const barBig = context.measureText(`${xp || 0} / ${xpAmounts[0]} XP`).width + 10 < ((xp / xpAmounts[0]) * progressBar.width)
    context.textAlign = "center"
    context.fillStyle = barBig ? ((theme == "light") ? "#000" : "#fff") : themecolor
    context.fillText(`${xp || 0} / ${xpAmounts[0]} XP`, (barBig ? ((xp / xpAmounts[0]) * progressBar.width) / 2 : canvas.width / 2), statText.y)

    // message text
    // context.textAlign = "center"
    // context.fillStyle = "#fff"
    // context.font = '18px Open Sans Bold'
    // context.fillText(`${mentionedGuildProfile?.activity?.overall?.messages || 0} Messages`, canvas.width / 2, statText.y)

    // avatar drawing
    const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: 'png' }));
    roundedClip(context, 20, profile.y, 45, 45, 5);
    if (config.showUserAvatar) context.drawImage(avatar, 20, profile.y, 45, 45);

    const attachment = new MessageAttachment(canvas.toBuffer(), `${user.username}-profile.png`);

    let components = []

    if (interaction?.message) {
        interaction.deferUpdate()
        interaction.message.edit({ files: [attachment], components, embeds: [] }).then(m => {
            components = [
                new MessageActionRow().addComponents([new MessageButton().setURL(m.attachments.first().url).setStyle('LINK').setLabel("Image Url"),
                ])]
            m.edit({ components })
        })
    } else {
        message.reply({ files: [attachment], components }).then(m => {
            components = [new MessageActionRow().addComponents([
                new MessageButton().setURL(m.attachments.first().url).setStyle('LINK').setLabel("Image Url"),
            ])]
            m.edit({ components })
        })
    }
}