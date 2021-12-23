const utils = require('../../utils')
const Command = utils.Command
const guildProfileSc = require('../../schemas/guildProfile')

const command = module.exports = new Command()

command
    .create(["bypass"], "Create a button list of roles!")
    .setRestriction("DEV")
    .setExecute(execute)

async function execute(toolbox) {
    const { message, userGuildProfile, } = toolbox
    const { _id, __v, ...userGuildProfile_ } = userGuildProfile.toObject()
    userGuildProfile_.bypass = userGuildProfile.bypass ? false : true
    guildProfileSc.updateOne({ userId: message.author.id, guildId: message.guild.id }, userGuildProfile_).then(r => console.log(r))
    return toolbox.message.reply(`Bypass toggled to ${userGuildProfile_.bypass}`)
}