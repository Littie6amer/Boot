const utils = require('../../utils')
const command = new utils.Command()
const guildProfileSc = require('../../schemas/guildProfile')
const { MessageEmbed } = require('discord.js')
const guildData = require('../../schemas/guildData')

command
    .create(["ev", "eval"], "Scary command")
    .setExecute(execute)
    .restrict()

module.exports = command

async function execute(toolbox) {
    const { message, args } = toolbox
    try {
        let exe = await eval(args.join(' '))
        let embed = new MessageEmbed().addField('Output', `\`\`\`${typeof exe == "object" ? JSON.stringify(exe) : exe}\`\`\``)
        message.channel.send({embeds: [embed]})
    } catch (err) {
        let embed = new MessageEmbed().addField('Output', `\`\`\`${err}\`\`\``)
        message.channel.send({ embeds: [embed]})
    }
}