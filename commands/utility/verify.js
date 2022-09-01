const utils = require('../../utils')
const command = new utils.Command()
const guildData = require('../../schemas/guildData')

command
    .create(["verify", "agree", "v"], "Verify in a server.")
    .setExecute(execute)

module.exports = command

async function execute(toolbox) {
    const { message, client, args, guildData, prefixes } = toolbox

    if (args[0] == "role") return setRole(toolbox)
    if (!guildData.verification?.roleId) return message.reply({ embeds: [await utils.embeds.error(`This server doesn't have a verification role set! Set one with \`${prefixes[0]}verify role [Role ID]\``)] })
    const role = message.guild.roles.cache.get(guildData.verification.roleId)
    if (!role) return message.reply({ embeds: [await utils.embeds.error(`This server doesn't have a verification role set! Set one with \`${prefixes[0]}verify role [Role ID]\``)] })
    if (!message.guild.me.permissions.has("MANAGE_ROLES")) return message.reply({ embeds: [await utils.embeds.error(`I don't have permissions to add roles!`)] })
    if (role.position >= message.guild.me.roles.highest.position) return message.reply({ embeds: [await utils.embeds.error(`Set verification role is too high!`)] })
    message.member.roles.add(role.id)
    if (message.deletable) message.delete()
}

async function setRole(toolbox) {
    const { message, client, args, guildData, prefixes } = toolbox

    if (!message.guild.me.permissions.has("MANAGE_ROLES")) return message.reply({ embeds: [await utils.embeds.error(`I don't have permissions to add roles!`)] });
    if (!message.member.permissions.has("MANAGE_ROLES")) return message.reply({ embeds: [await utils.embeds.error(`You don't have permissions to add roles!`)] });
    if (!args[1]) return message.reply({ embeds: [await utils.embeds.error(`No role supplied! \`${prefixes[0]}verify role [Role ID]\``)] })
    const role = message.guild.roles.cache.get(args[1])
    if (!role) return message.reply({ embeds: [await utils.embeds.error(`No role supplied! \`${prefixes[0]}verify role [Role ID]\``)] })
    if (role.position >= message.guild.me.roles.highest.position || role.position >= message.member.roles.highest.position) return message.reply({ embeds: [await utils.embeds.error(`Given role is too high!`)] })
    if (role.managed) return message.reply({ embeds: [await utils.embeds.error(`Given role is for a bot!`)] })
    guildData.verification = guildData.verification||{}
    guildData.verification.roleId = role.id
    guildData.save()
    message.reply({ embeds: [await utils.embeds.success(`Verification role set!`)] })
}