import { Client, SlashCommandBase } from "indigo-client";

import CreateChat from "./chat"

export default class SubCommand extends SlashCommandBase {
    constructor(client: Client) {
        super(client, {
            name: "create",
            description: "Create a channel for chatting",
            subcommands: [
                new CreateChat(client)
            ],
        })
    }
}