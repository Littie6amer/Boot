const { Collection } = require('discord.js')
const fs = require('fs')

// Load Commands
const commands = new Collection()
const buttons = new Collection()
const slashCommands = new Collection()
const dropDowns = {}
const invites = {}

console.log(`${Math.floor(process.uptime()*1000)} [loader.js]: Searching ./commands`)
loadFolder('./commands')
function loadFolder(path) {
    fs.readdirSync(path).forEach(c => {
        let path_ = path + '/' + c
        if (!path_.slice(1).includes('.')) {
            console.log(`${Math.floor(process.uptime()*1000)} [loader.js]: Searching ${path_}`)
            loadFolder(path_)
        }
        if (!path_.endsWith('.js')) { } else {
            c = require(path_)
            commands.set(c.names[0], c)

            if (c.buttons) {
                for (let button in c.buttons) {
                    buttons.set(button, c.buttons[button])
                }
            }

            if (c.dropDowns) {
                for (let dropDown in c.dropDowns) {
                    dropDowns[dropDown] = dropDowns[dropDown] || new Collection()
                    for (let option in c.dropDowns[dropDown].values) {
                        dropDowns[dropDown].set(option||"WILDCARD", c.dropDowns[dropDown].values[option])
                    }
                }
            }

            if (c.slashExecute) {
                slashCommands.set(c.names[0], { description: c.description, execute: c.slashExecute, name: c.names[0] })
            }
        }
    })
}

console.log(`~~~`)
console.log(`${Math.floor(process.uptime()*1000)} [loader.js]: ${commands.size} command(s) loaded!`)
console.log(`${Math.floor(process.uptime()*1000)} [loader.js]: ${buttons.size} buttons(s) loaded!`)
console.log(`${Math.floor(process.uptime()*1000)} [loader.js]: ${Object.keys(dropDowns).length} dropdown(s) loaded!`)
console.log(`${Math.floor(process.uptime()*1000)} [loader.js]: ${slashCommands.size} slash command(s) loaded!`)
console.log(`~~~`)

module.exports = { commands, dropDowns, buttons, slashCommands, invites }