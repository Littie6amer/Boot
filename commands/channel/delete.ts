import { GuildMember } from "discord.js";
import { Client, SlashCommandBase } from "indigo-client";
import { CommandContext } from "indigo-client/build/bases/CommandContext";

export default class SubCommand extends SlashCommandBase {
    constructor (client: Client) {
        super(client, {
            name: "delete",
            description: "Delete a channel"
        })
    }

    execute (ctx: CommandContext) {
        const { interaction } = ctx
        if (!ctx.checkPermissions("Channel", { member: ctx.me, permissions: ["ManageChannels", "ViewChannel"] })) return;
        if (!ctx.checkPermissions("Channel", { member: interaction.member as GuildMember, permissions: ["ManageChannels"] })) return;
        interaction.channel?.delete()
    }
}