const utils = require('../../utils')
const command = new utils.Command()
const getColors = require('get-image-colors')
const guildProfileSc = require('../../schemas/guildProfile')
const { MessageEmbed, MessageActionRow, MessageButton, Interaction } = require('discord.js');

command
    .create(["messages", "m"])
    .setExecute(execute)
    .addButton("messages:", execute, false)
    .makeSlashCommand()

module.exports = command

async function execute(toolbox) {
    const { message, args, client, interaction } = toolbox
    const { rbgToHex, findBrightestColor } = utils
    const input = interaction || message

    const values = interaction?.customId.slice("messages:".length).split('/#~~#/')
    if (values && (values[1] != interaction.member.id)) return

    let user;

    if (args && args[0]) {
        try { user = await client.users.fetch(args[0]) } catch { }
    } 
    
    if (values && values[0]) {
        try { user = await client.users.fetch(values[0]) } catch { }
    } 

    if (message && message.mentions.members.first() && !user) {
        user = message.mentions.members.first().user
    }

    if (!user) {
        user = input.member.user
    }

    const mentionedGuildProfile = await guildProfileSc.findOne({
        guildId: input.guild.id,
        userId: user.id
    })

    const colors = await getColors(user.displayAvatarURL({ format: 'png' }))

    const channels = []
    let deletedChannelCount = 0
    let deletedMesages = 0
    if (mentionedGuildProfile?.activity) Object.keys(mentionedGuildProfile.activity.channels.sort((a, b) => a.messages - b.messages).reverse()).forEach(channel => {
        channel = mentionedGuildProfile.activity.channels[channel]
        if (message.guild.channels.cache.get(channel.id) && message.member.permissionsIn(channel.id).has("VIEW_CHANNEL")) {
            if (message.member.permissions.has("MANAGE_MESSAGES")) {
                channels.push(`\`#${"00".slice(`${channels.length+1}`.length) + `${channels.length+1}`}\`<:Blank4:801947320064933909>[#${shorterText(message.guild.channels.cache.get(channel.id).name)}](https://canary.discord.com/channels/${message.guild.id}/${channel.id}) - **${channel.messages}** msgs, **${channel.replies}** replies, **${channel.spam}** spam`)
            } else {
                channels.push(`\`#${"00".slice(`${channels.length+1}`.length) + `${channels.length+1}`}\`<:Blank4:801947320064933909>[#${shorterText(message.guild.channels.cache.get(channel.id).name)}](https://canary.discord.com/channels/${message.guild.id}/${channel.id}) - **${channel.messages}** msgs, **${channel.replies}** replies`)
            }
        } else {
            deletedChannelCount++; deletedMesages += channel.messages
        }
    })

    const components = [new MessageActionRow().addComponents([
        new MessageButton().setCustomId('rank:' + user.id + "/#~~#/" + input.member.id).setEmoji('👤').setLabel('Rank').setStyle('SECONDARY'),
        //new MessageButton().setCustomId('rewards:' + user.id).setEmoji('🎁').setLabel('Rewards').setStyle('SECONDARY'),
    ])]

    const embed = new MessageEmbed()
        .setAuthor(user.username+ "\nShowing Top Channels", user.avatarURL())
        .setDescription(`${channels?.slice(0, 10).join('\n') ? `${channels?.slice(0, 10).join('\n ')}` : `<:redboot:902910668091576331> **No data collected on this user**`}`)// ${deletedChannelCount ? `\n**Hidden or deleted channels** \`${deletedChannelCount} channels\`\n<:Blank1:801947188590411786>**${deletedMesages}** messages` : ""}`)
        .setColor(findBrightestColor(colors).index > -1 ? rbgToHex(colors[findBrightestColor(colors).index]._rgb) : 0xbf943d)
    if (mentionedGuildProfile?.activity?.overall) {
        if (message.member.permissions.has("MANAGE_MESSAGES")) {
            embed.addField('Overall', `<:Blank1:801947188590411786>**${mentionedGuildProfile.activity.overall.messages}** messages<:Blank1:801947188590411786>**${mentionedGuildProfile.activity.overall.replies}** replies<:Blank1:801947188590411786>**${mentionedGuildProfile.activity.overall.spam}** spam`)
        } else {
            embed.addField('Overall', `<:Blank1:801947188590411786>**${mentionedGuildProfile.activity.overall.messages}** messages<:Blank1:801947188590411786>**${mentionedGuildProfile.activity.overall.replies}** replies`)
        }
    }
    if (interaction?.message) {
        interaction.deferUpdate()
        interaction.message.edit({ embeds: [embed], attachments: [], components })
    } else {
        input.reply({ embeds: [embed], components })
    }
}

function shorterText (text) {
    if (text.length > 15) text = text.slice(0, 15) + "..."
    return text
}

async function preview (toolbox) {

}