const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { Command } = require('../../utils');
const suggestionSc = require('../../schemas/guildSuggestion')
const utils = require('../../utils');

const command = module.exports = new Command()

command.create("suggest", "Suggest ideas for the bot!")
    .setExecute(execute)
    .addButton("upvote", upVoteExecute)
    .addButton("downvote", downVoteExecute)
    .addButton("options", optionsExecute)

async function execute(toolbox) {
    const { message, args, client, guildData } = toolbox
    //if (!guildData.suggestions.channelId) return message.reply({ embeds: [await utils.embeds.error(`This server doesn't have a suggestion channel set!`)] })
    if (!args[0]) return message.reply({ embeds: [await utils.embeds.simpleUsageEmbed(command, ` [Suggestion]`)] })
    message.reply({ embeds: [await utils.embeds.success(`Thank you for your suggestion!`)] })
    console.log(guildData)
    const channel = client.channels.cache.get("975049786052993054")
    const embed = new MessageEmbed()
        .setColor("2f3136")
        .setAuthor({ name: `New Suggestion!`, iconURL: client.user.avatarURL() })
        .setDescription(args.join(" "))
        .addField("Suggested By", `<@${message.author.id}>`)

    const buttons = [
        ...(guildData.suggestions.feedbackType == "VOTE" ? [
            new MessageButton().setCustomId("upvote").setStyle("SUCCESS").setEmoji("<:upvote:975056873910841344>"),
            new MessageButton().setCustomId("downvote").setStyle("DANGER").setEmoji("<:downvote:975056912548773948>"),
        ] : []),
        new MessageButton().setEmoji("<:plus:975047358796681216>").setCustomId("options").setStyle("SECONDARY"),
    ]
    const components = [
        new MessageActionRow().addComponents(buttons),
    ]

    const msg = await channel.send({ embeds: [embed], components })

    await suggestionSc.create({
        guildId: "882345419852632114", // change to message.guild.id
        messageId: msg.id,
        authorId: message.author.id,
        authorTag: message.author.tag,
        content: args.join(" "),
        thread: false
    })
    if (guildData.suggestions.feedbackType == "THREAD") {
        const thread = await msg.startThread({ name: "What do you think?" })
        embed
            .setColor("2f3136")
            .setDescription("Please keep all messages here as respectful as possible!")
            .setAuthor(null).setFooter(null).setThumbnail("").setTitle("")
        thread.send({ embeds: [embed] })
    }
}

async function upVoteExecute(toolbox) {
    const { interaction } = toolbox
    let suggestionData = await suggestionSc.findOne({
        guildId: interaction.message.guild.id,
        messageId: interaction.message.id
    })
    if (suggestionData.votes.positive.includes(interaction.member.id)) {
        toolbox.interaction.reply({ content: "You've already upvoted!", ephemeral: true })

    } else {
        if (suggestionData.votes.negative.includes(interaction.member.id)) suggestionData.votes.negative = suggestionData.votes.negative.filter(id => id != interaction.member.id)
        suggestionData.votes.positive.push(interaction.member.id)
        suggestionData.save()
        toolbox.interaction.reply({ content: "Upvoted!", ephemeral: true })
    }

    const suggestionAuthor = interaction.message.guild.members.cache.get(suggestionData.authorId)
    const embed = new MessageEmbed()
        .setColor("2f3136")
        .setAuthor({ name: `New Suggestion!`, iconURL: toolbox.client.user.avatarURL() })
        .setDescription(suggestionData.content)
        .addField("Votes", `<:upvote:975056873910841344> \`${suggestionData.votes.positive.length}\`\n<:downvote:975056912548773948> \`${suggestionData.votes.negative.length}\``)
        .addField("Suggested By", `<@${suggestionData.authorId}>`)
    interaction.message.edit({ embeds: [embed] })
}

async function downVoteExecute(toolbox) {
    const { interaction } = toolbox
    let suggestionData = await suggestionSc.findOne({
        guildId: interaction.message.guild.id,
        messageId: interaction.message.id
    })
    if (suggestionData.votes.negative.includes(interaction.member.id)) {
        toolbox.interaction.reply({ content: "You've already downvoted!", ephemeral: true})

    } else {
        if (suggestionData.votes.positive.includes(interaction.member.id)) suggestionData.votes.positive = suggestionData.votes.positive.filter(id => id != interaction.member.id)
        suggestionData.votes.negative.push(interaction.member.id)
        suggestionData.save()
        toolbox.interaction.reply({ content: "Downvoted!", ephemeral: true })
    }

    const suggestionAuthor = interaction.message.guild.members.cache.get(suggestionData.authorId)
    const embed = new MessageEmbed()
        .setColor("2f3136")
        .setAuthor({ name: `New Suggestion!`, iconURL: toolbox.client.user.avatarURL() })
        .setDescription(suggestionData.content)
        .addField("Votes", `<:upvote:975056873910841344> \`${suggestionData.votes.positive.length}\`\n<:downvote:975056912548773948> \`${suggestionData.votes.negative.length}\``)
        .addField("Suggested By", `<@${suggestionData.authorId}>`)
    interaction.message.edit({ embeds: [embed] })
}

async function optionsExecute(toolbox) {
    const { interaction } = toolbox
    let suggestionData = await suggestionSc.findOne({
        guildId: interaction.message.guild.id,
        messageId: interaction.message.id
    })
    const components = [
        new MessageActionRow().setComponents([
            new MessageButton().setStyle("LINK").setLabel(suggestionData.authorTag).setURL(`https://discord.com/users/${suggestionData.authorId}`)
        ])
    ]
    const embed = new MessageEmbed()
        .setColor("2f3136")
        .setDescription(suggestionData.content)
        .setFooter(`⬆️ ${suggestionData.votes.positive.length} ⬇️ ${suggestionData.votes.negative.length}`)
        .setColor("2f3136")
    interaction.reply({ ephemeral: true, components, embeds: [embed] })
}