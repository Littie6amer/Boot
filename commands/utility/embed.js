const { Command } = require("../../utils")

const command = module.exports = new Command()

command
    .create(["embed"], "Create an embed")
    .setExecute(execute)

function execute(toolbox) {
    
}