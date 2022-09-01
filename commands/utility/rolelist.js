const utils = require('../../utils')
const d = utils.emojis.d; const b = utils.emojis.b
const { MessageButton, MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const { Command } = require('../../utils');

const command = module.exports = new Command()

command.create(["selectionroles", "sr", "selects", "rolelist", "rl"])
    .setPreviewExecute(execute)
    .addDropOption("roleList", [""], roleExecute, false)
    .restrict()

async function execute(toolbox) {
    const { message, client, args } = toolbox
    const owner = await message.guild.fetchOwner()

    if (!args[0] || !args[1]) return message.reply({ embeds: [await utils.embeds.simpleUsageEmbed(command, ` [select | toggle] "[Title]" (:emoji: @Role) (:emoji: @Role) (:emoji: @Role)`)] })
    if (!message.member.permissions.has('MANAGE_ROLES')) return message.reply({ content: `You dont have perms to add roles!` });
    if (!message.guild.me.permissions.has('MANAGE_ROLES')) return message.reply({ content: `I am unable to add roles, check my permissions!` });
    const mode = args.shift().toLowerCase()
    if (!["select", "toggle"].includes(mode)) return message.reply({ embeds: [await utils.embeds.simpleUsageEmbed(command, ` [select | toggle] "[Title]" (:emoji: @Role) (:emoji: @Role) (:emoji: @Role)`)] })

    if (!args[0].startsWith("\"") || !args[args.length - 1].endsWith(")") || !args.join(" ").slice(1, -1).split("\" (")[1]) return message.reply({ embeds: [await utils.embeds.simpleUsageEmbed(command, ` [select | toggle] "[Title]" (:emoji: @Role) (:emoji: @Role) (:emoji: @Role)`)] })
    const options = args.join(" ").slice(1, -1).split("\" (").join(") (").split(") (")
    const title = options.shift()
    const errors = {}

    for (let o = 0; o < options.length; o++) {
        options[o] = options[o].split(" ").filter(val => val.length).slice(0, 2)

        let emoji;
        if (options[o][1]) emoji = (await utils.getEmojiData(options[o][0], client))?.mention
        let role = message.guild.roles.cache.get((options[o][1] ? options[o][1] : options[o][0]).replace("<@&", "").replace(">", ""))

        if (checkRole(role, message, owner, errors).length) errors[role?.id || "null"] = errors[role?.id || "null"] ? [...errors[role?.id || "null"], ...checkRole(role, message, owner, errors)] : [...checkRole(role, message, owner, errors)]
        if (checkEmoji(emoji).length) errors[role?.id || "null"] = errors[role?.id || "null"] ? [...errors[role?.id || "null"], ...checkEmoji(emoji)] : [...checkEmoji(emoji)]

        if (errors[role?.id || "null"]) options[o] = null
        else options[o] = {
            label: role.name,
            roleId: role.id,
            mention: emoji ?? "<:dot:871478724439179306>"
        }

    }

    if (Object.keys(errors).length) return await message.reply({ content: `\`\`\`${Object.keys(errors).map(err => errors[err].map(e => `${err} (@${message.guild.roles.cache.get(err)?.name}): ${e}`).join("\n")).join("\n")}\`\`\``, embeds: [utils.embeds.error(`This request returned some errors`)]})
    if (options.length < 1 || options.length > 10) return message.reply({ content: `1-10 Roles are needed` });
    if (options.length > (Array.from(new Set(options.map(op => op.roleId))).length)) return message.reply({ content: `Duplicate roles!` });
    return message.reply(mode)

    const embed = new MessageEmbed()
        .setTitle(title)
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

function checkRole(role, message, owner, errs) {
    let errors = []
    if (!role) return ["Role does not exist"]
    if (errs[role.id]) return ["Role provided twice!"]
    if (owner.id == message.author.id ? false : message.member.roles.highest.position == role.position) errors.push("This role your highest role!")
    if (owner.id == message.author.id ? false : message.member.roles.highest.position < role.position) errors.push("This role is above your highest role!")
    if (message.guild.me.roles.highest.position == role.position) errors.push("This role is my highest role!")
    if (message.guild.me.roles.highest.position < role.position) errors.push("This role is above my highest role!")
    if (role.managed) errors.push("This role is for a bot!")
    return errors
}

function checkEmoji(emoji) {
    let errors = []
    if (emoji == null) return []
    if (!emoji.guildId && emoji.type == "custom") errors.push("Emoji provided for this role is not in your guild!")
    return errors
}