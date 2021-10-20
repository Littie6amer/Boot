const utils = require('../../utils')
const d = utils.emojis.d; const b = utils.emojis.b
const Canvas = require('canvas');
const getColors = require('get-image-colors')
const {MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed, MessageAttachment} = require('discord.js');

const resources = {
    "fireBackground": "https://images.pexels.com/photos/73873/star-clusters-rosette-nebula-star-galaxies-73873.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "waterBackground": "https://images.pexels.com/photos/2775196/pexels-photo-2775196.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "airBackground": "https://images.pexels.com/photos/66997/pexels-photo-66997.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    "groundBackground": "https://images.pexels.com/photos/1743165/pexels-photo-1743165.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
}

function parseXp (xp) {
    let xpAmounts = [50, 100, 150, 200]
    let level = 0;
    while (xp > xpAmounts[0]) {
        level++; xp -= xpAmounts[0]
        if (xpAmounts[1]) xpAmounts.shift()
    }
    return {level, xp, xpAmounts}
}

function rbgToHex (rgb) {
    function denaryToHex (denary) {
        denary = denary.toString(16)
        if (denary.length < 2) denary = "0"+denary
        return denary
    } 

    rgb = [
        denaryToHex(rgb[0]), 
        denaryToHex(rgb[1]), 
        denaryToHex(rgb[2])
    ]
    return `#${rgb.join('')}`
}

function findBrightestColor (arr) {
    let brightest = {
        index: -1,
        value: 0,
    } 

    for (let index in arr) {
        let value = arr[index]._rgb[0]+arr[index]._rgb[1]+arr[index]._rgb[2]
        if (value > 100 && !brightest.value) {
            brightest.index = index; brightest.value = value
        }
    }

    return brightest
}

module.exports = {
    name: "rank",
    aka: ['level', 'l'],
    async run (toolbox) {
        const {message, client, userGuildProfile} = toolbox
        let {level, xp, xpAmounts} = parseXp(userGuildProfile.leveling.xp)

        const colors = await getColors(message.author.displayAvatarURL({ format: 'png' }))

        const canvas = Canvas.createCanvas(560, 200)
        const context = canvas.getContext('2d')
        // context.fillStyle = '#a7a4ad';
		// context.fillRect(0, 0, canvas.width, canvas.height);
        const ran = Math.floor(Math.random()*4)
        const images = [resources.fireBackground, resources.groundBackground, resources.airBackground, resources.waterBackground]

        const image = await Canvas.loadImage(images[ran]);
		context.drawImage(image, 0, 0, canvas.width, canvas.height);
        
        // guild text
        context.fillStyle = ran == 0 ? "#fff" : "#000"
        context.font = '25px sans-serif'
        context.textAlign = "center"
        context.fillText(message.guild.name, 280, 35)
        context.textAlign = "left"
        
        // profile card background color
        context.fillStyle = "#000"
        context.fillRect(10, 50, 540, 60)
        
        // avatar drawing
        const avatar = await Canvas.loadImage(message.author.displayAvatarURL({ format: 'jpg' }));
		context.drawImage(avatar, 10, 50, 60, 60);

        // username text
        context.fillStyle = findBrightestColor(colors).index > -1 ?  rbgToHex( colors[ findBrightestColor(colors).index ]._rgb ) : "#ffffff"
        context.font = '25px sans-serif'
        context.fillText(message.author.username, 90, 90)
        
        // progress background color
        context.fillStyle = "#000"
        context.fillRect(10, 115, 540, 20)
        
        // progress bar
        context.fillStyle = findBrightestColor(colors).index > -1 ?  rbgToHex( colors[ findBrightestColor(colors).index ]._rgb ) : "#ffffff"
        context.fillRect(10, 115, (xp/xpAmounts[0])*540, 20)
        
        // line at the bottom for the looks
        context.fillStyle = "#000"
        context.fillRect(10, 140, 540, 30)

        // level text
        context.fillStyle = "#fff"
        context.font = '20px sans-serif'
        context.fillText(`Level ${level}`, 15, 160)
        
        // xp text
        context.fillStyle = "#fff"
        context.font = '20px sans-serif'
        context.textAlign = "right"
        context.fillText(`${xp}/${xpAmounts[0]}XP`, 540, 160)
        
        
		const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png');

        message.reply({ files: [attachment] })
    }
}

