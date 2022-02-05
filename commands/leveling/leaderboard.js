const utils = require('../../utils')
const command = new utils.Command()
const guildProfileSc = require('../../schemas/guildProfile')

command
    .create(["leaderboard", "lb"])
    .setExecute(execute)
    //.addButton("messages:", execute, false)
    .makeSlashCommand()

module.exports = command

async function execute(toolbox) {
    const { message, args, client, interaction } = toolbox

}
