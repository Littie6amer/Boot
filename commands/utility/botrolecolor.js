const utils = require('../../utils')
const Command = utils.Command
const { MessageActionRow, MessageEmbed } = require('discord.js')

const command = module.exports = new Command()

command
    .create(["botrolecolor", "brc"], "Make all bot roles a certain color!", 60000)
    .restrict(execute)

async function execute (toolbox) {
    const { message, client, args } = toolbox

    if (!args[0]) return message.reply({ embeds: [await utils.embeds.simpleUsageEmbed(command, ` [Hex Color]`)] })

} 