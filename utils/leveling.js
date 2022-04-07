const Canvas = require('canvas');
const ms = require("ms")
const { DiscordAPIError, MessageEmbed } = require('discord.js');

const leveling = []

leveling.resources = {
    "backgroundImages": [
        "https://images.pexels.com/photos/2775196/pexels-photo-2775196.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", // Water Background
        "https://media.discordapp.net/attachments/801524339265503294/961290936992804975/download.jpg?width=788&height=443",
        "https://images.pexels.com/photos/66997/pexels-photo-66997.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500", // Air Background
        "https://images.pexels.com/photos/1743165/pexels-photo-1743165.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500", // Ground Background
    ],
    "solidBackgroundColors": [
        "#60cae5", // Blue
        "#e5de60", // Yellow
        "#e5b060", // Orange
        "#93e560" // Green
    ]
}

function getRandomXp(between) {
    if (!between) return 0
    return Math.floor((Math.random() * between[1]) + between[0])
}

leveling.getRandomXp = getRandomXp

function parseXp(xp) {
    let xpAmounts = [50, 100, 150, 200, 300, 400, 500, 750, 1000, 2000, 3000, 4000, 5000, 7500, 10000]
    let level = 0;
    while (xp > xpAmounts[0]) {
        level++; xp -= xpAmounts[0]
        if (xpAmounts[1]) xpAmounts.shift()
    }
    return { level, xp, xpAmounts }
}

leveling.parseXp = parseXp

async function applyBackground(canvas, context, provided) {
    if (provided.startsWith('#')) {
        context.fillStyle = provided
        roundedRect(context, 0, 0, canvas.width, canvas.height, 20)
    } else {
        const image = await Canvas.loadImage(provided);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
}

leveling.applyBackground = applyBackground

// taken from https://stackoverflow.com/questions/19585999/canvas-drawimage-with-round-corners
function roundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.fill()
}

leveling.roundedRect = roundedRect

function roundedClip(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.clip()
}

leveling.roundedClip = roundedClip

async function levelUpMessageVars(string, userGuildProfile, message, xpGain) {

    let leveling = userGuildProfile.leveling
    let { beforeGainLevel, afterGainLevel } = {
        beforeGainLevel: parseXp(leveling.xp),
        afterGainLevel: parseXp(leveling.xp + xpGain)
    }
    return (require('./stringVar'))(string, {
        "level": {
            "new": {
                "number": afterGainLevel.level,
                "xp": afterGainLevel.xpAmounts[0],
                "totalXp": userGuildProfile.leveling.xp
            },
            "last": {
                "number": beforeGainLevel.level,
                "xp": beforeGainLevel.xpAmounts[0],
                "totalXp": userGuildProfile.leveling.xp - beforeGainLevel.xpAmounts[0]
            }
        },
        "member": {
            "username": message.author.username,
            "mention": `<@${message.author.id}>`,
            "tag": message.author.tag,
            "nickname": message.member.nickname || message.author.username,
            "status": {
                "name": message.member.status
            }
        },
        "empty": "<:Blank1:801947188590411786>"
    })
}

leveling.levelUpMessageVars = levelUpMessageVars

function configEmbed (guildData, message, show) {
    const data = {
        enabled: guildData.leveling.enabled ? "Enabled" : "Disabled",
        floorRate: guildData.leveling.xp.rate[0],
        ceilingRate: guildData.leveling.xp.rate[1],
        timeout: ms(guildData.leveling.xp.timeout, { long: true }),
        messageEnabled: guildData.leveling.message.enabled ? "Enabled" : "Disabled",
        channel: guildData.leveling.message.channel == "ANY" || !message.guild.channels.cache.get(guildData.leveling.message.channel) ? "Anywhere" : `#${message.guild.channels.cache.get(guildData.leveling.message.channel).name}`,
        embed: guildData.leveling.message.embed ? "Enabled" : "Disabled",
        content: guildData.leveling.message.content
    }
    const embed = new MessageEmbed()
    .setAuthor({ name: message.guild.name + (message.guild.name.endsWith("s") ? "'" : "'s") + " Settings", iconURL: message.guild.iconURL() })
    .setColor("2f3136")
    .setFooter({ text: "Leveling Module", iconURL: "https://cdn4.iconfinder.com/data/icons/ui-actions/21/gear_cog-256.png" })
    if (show.includes("xp")) {
        embed.addField('Xp Settings', `\`\`\`This is: ${data.enabled} \nFloor Rate: ${data.floorRate}\nCeiling Rate: ${data.ceilingRate}\nTimeout: ${data.timeout}\`\`\``)
    }
    if (show.includes("message")) {
        embed.addField('Level Up Message Settings', `\`\`\`This is: ${data.messageEnabled} \nEmbed: ${data.embed}\nChannel: ${data.channel}\`\`\``)
        .addField('Level Up Message Content', `\`\`\`${data.content}\`\`\`\n[Leveling message variables](https://boot.tethys.club/vars/level-up-messages)`)
    }
    return embed
}

leveling.configEmbed = configEmbed

module.exports = leveling