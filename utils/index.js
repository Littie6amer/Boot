const { MessageEmbed } = require('discord.js');

const utils = {};

function rbgToHex(rgb) {
    function denaryToHex(denary) {
        denary = denary.toString(16)
        if (denary.length < 2) denary = "0" + denary
        return denary
    }

    rgb = [
        denaryToHex(rgb[0]),
        denaryToHex(rgb[1]),
        denaryToHex(rgb[2])
    ]
    return `#${rgb.join('')}`
}

utils.rbgToHex = rbgToHex

function findBrightestColor(arr) {
    let brightest = {
        index: -1,
        value: 0,
    }

    for (let index in arr) {
        let value = arr[index]._rgb[0] + arr[index]._rgb[1] + arr[index]._rgb[2]
        if (value > 100 && !brightest.value) {
            brightest.index = index; brightest.value = value
        }
    }

    return brightest
}


utils.findBrightestColor = findBrightestColor

utils.colors = { gold: "bf943d", christmasGreen: "529b3a" }

utils.emojis = { b: "<:Blank1:801947188590411786>", d: "<:dot:871478724439179306>" }

utils.embeds = require('./embeds')

utils.stringVars = require('./stringVar')

utils.leveling = require('./leveling')

utils.Command = require('./commandBase')

utils.testmedaddy = require('./testmedaddy')

function configEmbed(guildData, message) {
    const data = {
        enabled: guildData.leveling.enabled ? "Enabled" : "Disabled",
    }
    const embed = new MessageEmbed()
        .setAuthor(message.guild.name, message.guild.iconURL())
        .setColor("2f3136")
        .setFooter("Activity Module Settings", "https://cdn4.iconfinder.com/data/icons/ui-actions/21/gear_cog-256.png")
        .addField('Activity', `\`\`\`This is: ${data.enabled}\`\`\``)

    return embed
}

utils.activity = {}
utils.activity.configEmbed = configEmbed

utils.getEmojiData = (require("./emojis")).getEmojiData

module.exports = utils