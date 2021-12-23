const utils = require('../../utils')
const Command = utils.Command
const guildProfileSc = require('../../schemas/guildProfile')
const { MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js')
const guildDataSc = require('../../schemas/guildData')

const command = module.exports = new Command()

command
    .create(["buttonrole", "br", "buttons"], "Create a button list of roles!")
    .setExecute(execute)
    .addButton("br:", roleExecute, false)


async function execute(toolbox) {
    const { message, client, args } = toolbox

    if (!args[0]) {
        const embed = await utils.embeds.simpleUsageEmbed(command, " [Embed Content] @Role @Role @Role...")
        return message.reply({ embeds: [embed] })
    }
    if (!message.member.permissions.has('MANAGE_ROLES')) return message.reply({ content: `You dont have perms to add roles!` });
    if (!message.guild.me.permissions.has('MANAGE_ROLES')) return message.reply({ content: `I am unable to add roles, check my permissions!` });

    const getColors = require('get-image-colors')
    const colors = await getColors(message.guild.iconURL({ format: "png" }))

    let pos
    for (let word in args) {
        if (
            message.guild.roles.cache.get(args[word]
                .replace(`<`, '').replace(`@`, '').replace(`&`, '').replace(`!`, '').replace(`>`, '')) && !pos
        ) {
            pos = word
        }
    }
    if (!pos) return message.reply('Are you sure, you mentioned a role?')

    if (!args.slice(0, pos).length) {
        const embed = await utils.embeds.simpleUsageEmbed(command, " [Embed Content] @Role @Role @Role...")
        return message.reply({ embeds: [embed] })
    }

    const embeds = [new MessageEmbed()
        .setDescription(args.slice(0, pos).join(' '))
        .setColor(0xbf943d)
        .setFooter('Select the buttons below to add/remove a role')]

    let options = []; let ids = []

    args.slice(pos).forEach(role => {
        if (options > 4) { } else {
            role = role.replace(`<`, '').replace(`@`, '').replace(`&`, '').replace(`!`, '').replace(`>`, '')
            if (message.guild.roles.cache.get(role) && !ids.includes(role)) {
                if (message.member.roles.highest.position <= message.guild.roles.cache.get(role).position) return message.reply({ content: `You don't have perms to add **${message.guild.roles.cache.get(role).name}** role` });
                if (message.guild.me.roles.highest.position <= message.guild.roles.cache.get(role).position) return message.reply({ content: `I don't have perms to add **${message.guild.roles.cache.get(role).name}** role` });
                options.push({ "type": 2, "label": message.guild.roles.cache.get(role).name, "style": 2, "custom_id": "br:" + role })
                ids.push(role)
            }
        }
    });
    console.log(ids)

    const row = new MessageActionRow()
        .addComponents(options);

    if (message.guild.me.permissionsIn(message.channel.id).has('MANAGE_MESSAGES')) { message.delete() }

    message.channel.send({ embeds, ephemeral: true, components: [row] })

}

function roleExecute(toolbox) {
    const { interaction } = toolbox
    const values = interaction?.customId.slice("br:".length).split('/#~~#/') || []

    let role = interaction.message.guild.roles.cache.get(values[0])
    if (!interaction.message.guild.me.permissions.has('MANAGE_ROLES')) return interaction.reply({ ephemeral: true, content: `I am unable to add role **${role.name}**, check my permissions!` });
    if (role) {
        if (interaction.message.guild.me.roles.highest.position <= role.position) return interaction.reply({ ephemeral: true, content: `I am unable to add role **${role.name}**, check the position of my highest role!` });
        if (interaction.member.roles.cache.get(role.id)) {
            interaction.member.roles.remove(role.id)
            interaction.reply({ ephemeral: true, content: `**${role.name}** role was taken from you.` })
        } else {
            interaction.member.roles.add(role.id)
            interaction.reply({ ephemeral: true, content: `You were given **${role.name}** role` })
        }
    }
}