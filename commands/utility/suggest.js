const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { Command } = require('../../utils');
const utils = require('../../utils');

const command = module.exports = new Command()

command.create("suggest", "Suggest ideas for the bot!")
    .setExecute(execute)

async function execute(toolbox) {
    const { message, args, client, guildData } = toolbox
    if (!guildData.suggestions.channelId) return message.reply({ embeds: [await utils.embeds.error(`This server doesn't have a suggestion channel set!`)] })
    if (!args[0]) return message.reply({ embeds: [await utils.embeds.simpleUsageEmbed(command, ` [Suggestion]`)] })
    message.reply({ embeds: [await utils.embeds.success(`Thank you for your suggestion!`)] })

    const channel = client.channels.cache.get("891788195442876416")
    const embed = new MessageEmbed()
        .setColor("2f3136")
        .setDescription(args.join(" "))

    const msg = await channel.send({ content: `New suggestion by **${message.author.username}**`, allowedMentions: {parse: ["everyone", "roles"]}, embeds: [embed] })
    const thread = await msg.startThread({ name: "What is your opinion on this?" })

    const components = [new MessageActionRow().addComponents([new MessageButton().setLabel("Delete Suggestion").setCustomId("purgeSuggestion").setStyle("DANGER"), new MessageButton().setLabel("Delete Thread").setCustomId("purgeThread").setStyle("DANGER")])]
    thread.send({ content: "Moderator Only Controls", components })
    embed
        .setColor("GREEN")
        .setAuthor({ name: "What do you think about this suggestion?" })
        .setDescription("Please keep all messages here as respectful as possible!")
        .setFooter({ text: channel.guild.name, iconURL: channel.guild.iconURL() })
    thread.send({ embeds: [embed] })
}