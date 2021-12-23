const { Command } = require("../../utils")
const command = new Command()

command.create(["ping", "pong"])
    .setExecute(execute)
    .makeSlashCommand()

module.exports = command

function execute(toolbox) {
    const {interaction, message, client} = toolbox
    const input = interaction || message
    input.reply(`Pong! \`${client.ws.ping}ms\``)
}