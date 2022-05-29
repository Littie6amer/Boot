const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js")
const { Command } = require("../../utils")
const utils = require("../../utils")

const command = module.exports = new Command()

command
    .create(["u", "usr", "user"], "User utilties")
    .setPreviewExecute(execute)

async function execute(toolbox) {
    const { message, args, client, prefixes } = toolbox

    if (args.length < 2) return message.reply({
        embeds: [
            new MessageEmbed()
                .setDescription(`\`${prefixes[0]}user info [user id | @user]\``)
                .setColor('BLURPLE')
        ]
    })

    let embeds = []
    let components = []

    switch (args[0]) {
        case "info": {
            const embed = new MessageEmbed()
            .setAuthor({ name: "I guess I'll do the rest tomorrow!" })
            return message.reply({ embeds: [embed] })
        }; break
    }

    if (embeds.length) return message.reply({ embeds: embeds.slice(0, 5), components })
}