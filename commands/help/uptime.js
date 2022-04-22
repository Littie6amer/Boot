const { MessageEmbed } = require("discord.js")
const ms = require("ms")
const { Command } = require("../../utils")
const command = new Command()

command.create(["uptime", "up"])
    .setExecute(execute)
    .makeSlashCommand()

module.exports = command

function execute(toolbox) {
    const {interaction, message, client} = toolbox
    const input = interaction || message

    const content = `:alarm_clock:<:Blank1:801947188590411786>${ms(Math.floor(client.uptime), { long: true })}`

    input.reply({ content })
}