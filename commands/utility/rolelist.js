const utils = require('../../utils')
const d = utils.emojis.d; const b = utils.emojis.b
const { MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const { Command } = require('../../utils');

const command = module.exports = new Command()

command.create(["selectionroles", "sr", "selects", "rolelist", "rl"])
    .setExecute(execute)
    .addDropOption("roleList", [""], roleExecute, false)

async function execute(toolbox) {
    const { message, client, args } = toolbox
    const owner = await message.guild.fetchOwner()

    if (!args[0]) {
        const embed = await utils.embeds.simpleUsageEmbed(command, ` "[Embed Content]" (:emoji: @Role) (:emoji: @Role) (:emoji: @Role)`)
        return message.reply({ embeds: [embed] })
    }
    if (!message.member.permissions.has('MANAGE_ROLES')) return message.reply({ content: `You dont have perms to add roles!` });
    if (!message.guild.me.permissions.has('MANAGE_ROLES')) return message.reply({ content: `I am unable to add roles, check my permissions!` });

    if (!args[0].startsWith("\"") || !args[args.length - 1].endsWith(")") || !args.join(" ").slice(1, -1).split("\" (")[1]) {
        const embed = await utils.embeds.simpleUsageEmbed(command, ` "[Embed Content]" (:emoji: @Role) (:emoji: @Role) (:emoji: @Role)`)
        return message.reply({ embeds: [embed] })
    }
    const options = args.join(" ").slice(1, -1).split("\" (").join(") (").split(") (")
    const content = options.shift()

    for (let o = 0; o < options.length; o++) {
        options[o] = options[o].split(" ").filter(val => val.length).slice(0, 2)

        let emoji;
        if (options[o][1]) emoji = options[o][0].match(/[\p{Emoji}\u200d]+/gu) ? options[o][0].match(/[\p{Emoji}\u200d]+/gu)[0] : client.emojis.get(options[o][0].replace("<((@!?\d+)|(:.+?:\d+))>", ""))[0]

        let role = message.guild.roles.cache.get((options[o][1] ? options[o][1] : options[o][0]).replace("<@&", "").replace(">", ""))

        let perfect = role && owner.id == message.author.id ? true : message.member.roles.highest.position >= role.position
        perfect && message.guild.me.roles.highest.position >= role.position
        perfect && !role.manage
        if (!perfect) role = null

        if (!role || role == null) {
            options[o] = null
        } else {
            options[o] = {
                label: role.name,
                value: role.id,
                emoji: emoji ? emoji : null
            }
        }
    }

    if (options.find(o => o) == null) message.reply({ content: `Please make sure permissions are correct or that one of the role is not a bot role!` });
    if (options.length < 1 || options.length > 10) message.reply({ content: `1-10 Roles are needed` });

    const embed = new MessageEmbed()
        .setDescription(content)
        .setColor(utils.colors.gold)

    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('roleList')
                .setPlaceholder('Select a role..')
                .addOptions(options),
        );

    if (message.guild.me.permissionsIn(message.channel.id).has('MANAGE_MESSAGES')) { message.delete() }

    message.channel.send({ embeds: [embed], ephemeral: true, components: [row] })
}

function roleExecute(toolbox) {
    const { interaction } = toolbox
    const { values } = interaction
    const embed = new MessageEmbed().setColor("GREEN")

    let role = interaction.message.guild.roles.cache.get(values[0])
    if (!interaction.message.guild.me.permissions.has('MANAGE_ROLES')) return interaction.reply({ ephemeral: true, content: `I am unable to add role **${role.name}**, check my permissions!` });
    if (role) {
        if (interaction.message.guild.me.roles.highest.position <= role.position) return interaction.reply({ ephemeral: true, content: `I am unable to add role **${role.name}**, check the position of my highest role!` });
        if (interaction.member.roles.cache.get(role.id)) {
            interaction.member.roles.remove(role.id)
            embed.setDescription(`<:check:835313672922071140><:Blank1:801947188590411786>You were unassigned <@&${role.id}>`)
            interaction.reply({ ephemeral: true, embeds: [embed] })
        } else {
            interaction.member.roles.add(role.id)
            embed.setDescription(`<:check:835313672922071140><:Blank1:801947188590411786>You were assigned <@&${role.id}>`)
            interaction.reply({ ephemeral: true, embeds: [embed] })
        }
        interaction.message.edit({ components: interaction.message.components })
    }
}