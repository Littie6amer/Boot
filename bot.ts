import { Client } from "indigo-client";

const client = new Client({
    intents: ["GuildMessages", "Guilds", "GuildMembers"],
    eventFolders: ["events"],
    commandFolders: ["commands"],
    mobileStatus: true,
    embedColor: "#a662e9"
})

client.login(process.env.BOT_TOKEN)