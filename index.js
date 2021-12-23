require('dotenv').config()
const fs = require('fs')
const { Client } = require('discord.js')
const client = new Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_PRESENCES"],
})

// Connect to the database

const mongoose = require('mongoose', {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
const url = process.env.dbToken
mongoose.connect(url).then(() => console.log(`${Math.floor(process.uptime()*1000)} [Mongoose]: Connected!`))

// Load commands

const loader = require('./loader')
Object.assign(client, loader, { cooldowns: {} })

// Create Listeners

fs.readdirSync('./events').forEach(e => {
    if (!e.endsWith('.js')) return
    client.on(e.slice(0, -3), (a, b) => {
        (require('./events/' + e))(client, a, b).catch(e => {
            console.log(`[Boot Manager Error]: Code error with the ${e} listener`)
            console.log(`~~~`)
            return console.error(e);
        })
    })
})

// Login to the bot

client.login(process.env.token)
