import { SlashCommand } from "indigo-client";
import { GuildMember } from "discord.js"

export const deleteCmd = {
    name: "delete",
    description: "...",
    execute(ctx) {
        const { interaction } = ctx
        if (!ctx.checkPermissions("Channel", { member: ctx.me, permissions: ["ManageChannels", "ViewChannel"] })) return;
        if (!ctx.checkPermissions("Channel", { member: interaction.member as GuildMember, permissions: ["ManageChannels"] })) return;
        interaction.channel?.delete()
    },
} as SlashCommand