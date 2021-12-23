const { Collection } = require('discord.js')
const fs = require('fs')
const config = require('./data/config.json')

const restrictions = config.restrictions

restrictions["all"] = 1

Object.keys(restrictions).forEach(key => {
    restrictions[key.toUpperCase()] = restrictions[key]
    delete restrictions[key]
})


// Load Commands
const commands = new Collection()
const buttons = new Collection()
const slashCommands = new Collection()
const dropDowns = {}
const invites = {}

console.log(`${Math.floor(process.uptime()*1000)} [${config.name}]: Searching ./commands`)
loadFolder('./commands')
function loadFolder(path) {
    fs.readdirSync(path).forEach(c => {
        let path_ = path + '/' + c
        if (!path_.slice(1).includes('.')) {
            console.log(`${Math.floor(process.uptime()*1000)} [${config.name}]: Searching ${path_}`)
            loadFolder(path_)
        }
        if (!path_.endsWith('.js')) { } else {
            c = require(path_)
            if (!restrictions[c.restriction]) throw `Invalid command restriction: "${c.restriction}"`
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
console.log(`${Math.floor(process.uptime()*1000)} [${config.name}]: ${commands.size} command(s) loaded!`)
console.log(`${Math.floor(process.uptime()*1000)} [${config.name}]: ${buttons.size} buttons(s) loaded!`)
console.log(`${Math.floor(process.uptime()*1000)} [${config.name}]: ${Object.keys(dropDowns).length} dropdown(s) loaded!`)
console.log(`${Math.floor(process.uptime()*1000)} [${config.name}]: ${slashCommands.size} slash command(s) loaded!`)
console.log(`~~~`)

module.exports = { commands, dropDowns, buttons, restrictions, slashCommands, invites }