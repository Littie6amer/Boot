import { Client, SlashCommandBase } from "indigo-client";

import Create from "./create"
import Delete from "./delete"

export class Command_ extends SlashCommandBase {
    constructor (client: Client) {
        super(client, {
            name: "channel",
            description: "Manage channels",
            subcommands: [
                new Create(client), new Delete(client)
            ]
        })
    }
}