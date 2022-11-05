import { SlashCommand } from "indigo-client";
import { chatCmd } from "./chat";

export const createCmd = {
    name: "create",
    description: "...",
    subcommands: [chatCmd]
} as SlashCommand