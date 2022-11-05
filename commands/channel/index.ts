import { SlashCommand } from "indigo-client";
import { createCmd } from "./create";
import { deleteCmd } from "./delete";

export const Command = {
    name: "channel",
    description: "...",
    subcommands: [createCmd, deleteCmd]
} as SlashCommand