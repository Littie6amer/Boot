import { ActivityType } from "discord.js";
import { Client, ClientEventBase } from "indigo-client";

export default class readyEvent extends ClientEventBase {
    constructor (client: Client) {
        super (client, {
            name: "ready",
        })
    }

    execute(): any {
        this.client.commandManager._inDev_Deploy("channel", "801498838774710283")
        this.client.commandManager._inDev_Deploy("aria", "801498838774710283")
        this.client.user?.setPresence({
            status: "idle",
            activities: [{
                name: "/aria | Aria!",
                type: ActivityType.Watching
            }]    
        })
    }
}