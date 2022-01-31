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

    for (let o = 0; o < options.length; o++) {
        options[o] = options[o].split(" ").filter(val => val.length).slice(0, 2)

        let emoji;
        if (options[o][1]) emoji = (await utils.getEmojiData(options[o][0], client))?.mention
        let role = message.guild.roles.cache.get((options[o][1] ? options[o][1] : options[o][0]).replace("<@&", "").replace(">", ""))

        let perfect = role && owner.id == message.author.id ? true : message.member.roles.highest.position >= role.position
        prefect = perfect && message.guild.me.roles.highest.position >= role.position
        prefect = perfect && !role.manage
        prefect = perfect && !(role.type = "custom" && !role.guildId)

        if (!perfect) options[o] = null
        else options[o] = {
            label: role.name,
            roleId: role.id,
            mention: emoji ?? "<:dot:871478724439179306>"
        }

    }

    if (options.find(o => o) == null) return message.reply({ content: `Please make sure permissions are correct or that one of the role is not a bot role!` });
    if (options.length < 1 || options.length > 10) return message.reply({ content: `1-10 Roles are needed` });

    const embed = new MessageEmbed()
        .setTitle(title)
        .setDescription("Join or leave a role by clicking the button!")
        .addField("Roles", options.map(o => `${o.mention} <@&${o.roleId}>`).join("\n"))
        .setColor("#2f3136")

    const row = new MessageActionRow()
        .addComponents(options.map(o => ({ type: "BUTTON", style: "PRIMARY", label: o.label, customId: "br:"+o.roleId })));

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
    
    interaction.reply({ ephemeral: true, embeds: [utils.embeds.success(`You were ${interaction.member.roles.cache.get(role.id) ? "assigned": "unassigned"} <@&${role.id}>`)] })
    
    if (interaction.member.roles.cache.get(role.id)) interaction.member.roles.remove(role.id)
    else interaction.member.roles.add(role.id)
}