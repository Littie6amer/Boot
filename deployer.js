const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v8');
const { Client } = require('discord.js');
const process_settings = require("./process-settings")
const env = require('dotenv')
env.config()
const rest = new REST({ version: '9' }).setToken(process_settings.botToken);
const fs = require('fs')
const commands = []
const commandNames = []

const client = new Client({ intents: [] });

loadFolder('./commands')
console.log(`~~~`)

client.on("ready", async () => {
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );

    console.log(`${Math.floor(process.uptime()*1000)} [${process_settings.name}]: ${commands.length} command(s) deployed!`)
    console.log(`${Math.floor(process.uptime()*1000)} [${process_settings.name}]: /${commandNames.join(' /')}`)
  } catch (error) {
    console.error(error);
  }

  client.destroy()
})

client.login(process_settings.botToken)

function loadFolder(path) {
  fs.readdirSync(path).forEach(c => {
    let path_ = path + '/' + c
    if (!path_.slice(1).includes('.')) {
      console.log(`${Math.floor(process.uptime()*1000)} [${process_settings.name}]: Searching ${path_}`)
      loadFolder(path_)
    }
    if (!path_.endsWith('.js')) { } else {
      c = require(path_)

      if (c.slashExecute) {
        commands.push({
          name: c.names[0],
          description: c.description,
          options: c.slashOptions
        })
        commandNames.push(c.names[0])
      }

    }
  })
}