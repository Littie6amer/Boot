const messageCreate = require("../../events/messageCreate")
const utils = require('../../utils')
const d = utils.emojis.dot; const b = utils.emojis.blank
const {MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed} = require('discord.js')

module.exports = {
    name: "test",
    aka: [],
    async run (toolbox) {
        const {message, client} = toolbox

        message.channel.send({content: await utils.stringVars(message.content, {"whosgay": {"muffin": true, "littie": false}}), allowedMentions: {parse: []}})
    }
}