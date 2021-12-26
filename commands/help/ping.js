const { MessageEmbed } = require("discord.js")
const { Command } = require("../../utils")
const command = new Command()

command.create(["ping", "pong"])
    .setExecute(execute)
    .makeSlashCommand()

module.exports = command

function execute(toolbox) {
    const {interaction, message, client} = toolbox
    const input = interaction || message
    
    let color;

    if        (client.ws.ping > 100)  { color = "red" } 
    else if   (client.ws.ping > 50)   { color = "yellow" } 
    else                              { color = "green" }

    const content = `:ping_pong: **Pong!**\n\n:${color}_circle: \`${client.ws.ping}ms\``

    input.reply({ content })
}