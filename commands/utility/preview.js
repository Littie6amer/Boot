const utils = require('../../utils')
const Command = utils.Command

const command = module.exports = new Command()

command
    .create(["preview", "beta", "pre"], "Preview new features!")
    .setExecute(execute)

async function execute(toolbox) {
    const { userGuildProfile, message } = toolbox
    userGuildProfile.preview = userGuildProfile.preview ? false : true
    userGuildProfile.save()
    if (message.reactable) toolbox.message.react(userGuildProfile.preview ? "<:enable:868669549371871322>" : "<:disabled:868669549376045088>")
    else message.reply(userGuildProfile.preview ? "<:enable:868669549371871322>" : "<:disabled:868669549376045088>")
}