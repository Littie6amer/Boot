const utils = require('../../utils')
const Command = utils.Command
const { MessageActionRow, MessageEmbed } = require('discord.js')

const command = module.exports = new Command()

command
    .create(["buttonrole", "br", "buttons"], "Create a button list of roles!")
    .setExecute(execute)
    .addButton("br:", roleExecute, false)


async function execute(toolbox) {
    const { message, client, args } = toolbox
    const owner = await message.guild.fetchOwner()

    if (!args[0]) return message.reply({ embeds: [await utils.embeds.simpleUsageEmbed(command, ` "[Title]" (:emoji: @Role) (:emoji: @Role) (:emoji: @Role)`)] })
    if (!message.member.permissions.has('MANAGE_ROLES')) return message.reply({ content: `You dont have perms to add roles!` });
    if (!message.guild.me.permissions.has('MANAGE_ROLES')) return message.reply({ content: `I am unable to add roles, check my permissions!` });

    if (!args[0].startsWith("\"") || !args[args.length - 1].endsWith(")") || !args.join(" ").slice(1, -1).split("\" (")[1]) return message.reply({ embeds: [await utils.embeds.simpleUsageEmbed(command, ` "[Title]" (:emoji: @Role) (:emoji: @Role) (:emoji: @Role)`)] })
    const options = args.join(" ").slice(1, -1).split("\" (").join(") (").split(") (")
    const title = options.shift()
    const errors = {}

    for (let o = 0; o < options.length; o++) {
        options[o] = options[o].split(" ").filter(val => val.length).slice(0, 2)

        let emoji;
        if (options[o][1]) emoji = (await utils.getEmojiData(options[o][0], client))?.mention
        const roleId = (options[o][1] ? options[o][1] : options[o][0]).replace("<@&", "").replace(">", "")
        let role = message.guild.roles.cache.get(roleId)

        if (checkRole(role, message, owner, errors).length) errors[role?.id || roleId] = errors[role?.id || roleId] ? [...errors[role?.id || roleId], ...checkRole(role, message, owner, errors)] : [...checkRole(role, message, owner, errors)]
        if (checkEmoji(emoji).length) errors[role?.id || "null"] = errors[role?.id || "null"] ? [...errors[role?.id || "null"], ...checkEmoji(emoji)] : [...checkEmoji(emoji)]

        if (!role?.id || errors[role?.id]) options[o] = null
        else options[o] = {
            label: role.name,
            roleId: role.id,
            mention: emoji ?? "<:dot:871478724439179306>"
        }

    }

    console.log(errors)
    if (Object.keys(errors).length) return await message.reply({ content: `\`\`\`${Object.keys(errors).map(err => errors[err].map(e => `${err} (@${message.guild.roles.cache.get(err)?.name||"deleted-role"}): ${e}`).join("\n")).join("\n")}\`\`\``, embeds: [utils.embeds.error(`This request returned some errors`)]})
    if (options.length < 1 || options.length > 10) return message.reply({ content: `1-10 Roles are needed` });
    if (options.length > (Array.from(new Set(options.map(op => op.roleId))).length)) return message.reply({ content: `Duplicate roles!` });

    const embed = new MessageEmbed()
        .setTitle(title)
        .setDescription("Join or leave a role by clicking the button!")
        .addField("Roles", options.map(o => `${o.mention} <@&${o.roleId}>`).join("\n"))
        .setColor("#2f3136")

    const row = new MessageActionRow()
        .addComponents(options.map(o => ({ type: "BUTTON", style: "PRIMARY", label: o.label, customId: "br:" + o.roleId })));

    if (message.guild.me.permissionsIn(message.channel.id).has('MANAGE_MESSAGES')) message.delete()

    message.channel.send({ embeds: [embed], ephemeral: true, components: [row] })
}

function roleExecute(toolbox) {
    const { interaction } = toolbox
    const values = interaction?.customId.slice("br:".length).split('/#~~#/') || []

    let role = interaction.message.guild.roles.cache.get(values[0])
    if (!role) return;
    if (!interaction.message.guild.me.permissions.has('MANAGE_ROLES')) return interaction.reply({ ephemeral: true, content: `I am unable to add role **${role.name}**, check my permissions!` });
    if (interaction.message.guild.me.roles.highest.position <= role.position) return interaction.reply({ ephemeral: true, content: `I am unable to add role **${role.name}**, check the position of my highest role!` });

    interaction.reply({ ephemeral: true, embeds: [utils.embeds.success(`You were ${interaction.member.roles.cache.get(role.id) ? "unassigned" : "assigned"} <@&${role.id}>`)] })

    if (interaction.member.roles.cache.get(role.id)) interaction.member.roles.remove(role.id)
    else interaction.member.roles.add(role.id)
}

function checkRole(role, message, owner, errs) {
    let errors = []
    if (!role) return ["Role does not exist"]
    if (errs[role.id]) return ["Role provided more than once!"]
    if (owner.id == message.author.id ? false : message.member.roles.highest.position == role.position) errors.push("This role is your highest role!")
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