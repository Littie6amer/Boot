import { ActivityType } from "discord.js";
import { Client, ClientEventBase } from "indigo-client";

export default class readyEvent extends ClientEventBase {
    constructor(client: Client) {
        super(client, {
            name: "ready",
        })
    }

    execute(): any {
        // this.client.commandManager._inDev_Deploy("commands", "801498838774710283")
        // this.client.commandManager._inDev_Deploy("boot", "801498838774710283")
        console.log(this.client.application?.commands.cache.size)
        this.client.user?.setPresence({
            status: "idle",
            activities: [{
                name: "/boot | Boot!",
                type: ActivityType.Watching
            }]
        })
    }
}