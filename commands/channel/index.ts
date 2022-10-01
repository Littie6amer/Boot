import { Client, SlashCommandBase } from "indigo-client";

import Create from "./create/index"
import Delete from "./delete"

export class Command extends SlashCommandBase {
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