const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { Command } = require('../../utils');
const utils = require('../../utils');

const command = module.exports = new Command()

command.create("suggest", "Suggest ideas for the bot!")
    .setExecute(execute)

async function execute(toolbox) {
    const { message, args, client, guildData } = toolbox
    //if (!guildData.suggestions.channelId) return message.reply({ embeds: [await utils.embeds.error(`This server doesn't have a suggestion channel set!`)] })
    if (!args[0]) return message.reply({ embeds: [await utils.embeds.simpleUsageEmbed(command, ` [Suggestion]`)] })
    message.reply({ embeds: [await utils.embeds.success(`Thank you for your suggestion!`)] })

    const channel = client.channels.cache.get("924436438802661436")
    const embed = new MessageEmbed()
        .setColor("2f3136")
        .setAuthor({ name: `${message.author.username}#${message.author.discriminator}\nNew Suggestion!` })
        .setThumbnail(message.author.avatarURL())
        .setDescription(args.join(" "))

    const components = [new MessageActionRow().addComponents([new MessageButton().setLabel("More Options").setCustomId("purgeSuggestion").setStyle("SECONDARY")])]
    const msg = await channel.send({ embeds: [embed], components })
    const thread = await msg.startThread({ name: "What do you think?" })
    embed
        .setColor("2f3136")
        .setThumbnail("")
        .setDescription("Please keep all messages here as respectful as possible!")
        .setAuthor({ name: "" })
        .setFooter({ text: "" })
    thread.send({ embeds: [embed] })
}