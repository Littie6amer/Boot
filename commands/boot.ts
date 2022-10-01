import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Client, CommandContext, SlashCommandBase } from "indigo-client";

export class Command extends SlashCommandBase {
    constructor(client: Client) {
        super(client, {
            name: "boot",
            description: "The help command needs a better description",
        })
    }

    execute(ctx: CommandContext) {
        const { interaction } = ctx
        function commandTree(name: string, subcommands: string[]) {
            return subcommands.map(cmd => `\`/${name} ${cmd}\``).join("\n")
        }
        const embed = new EmbedBuilder()
            .setColor(this.client.embedColor)
            .setAuthor({ name: (this.client.user?.username||"Boot")+" › Utility", iconURL: this.client.user?.avatarURL() || undefined })
            .setDescription(`Keeping things professional around your server.`)
            .addFields(
                [
                    { name: "Info", subcommands: ["channel"] },
                    { name: "Channel", subcommands: ["create", "delete", "name", "topic", "slowmode", "lock", "unlock", "hide", "show", "clear"] },
                ].map((cmd) => ({ name: cmd.name, value: commandTree(cmd.name.toLowerCase(), cmd.subcommands), inline: true }))
            )
        const components = [
            new ActionRowBuilder().setComponents([
                new ButtonBuilder()
                    .setCustomId("help-utility")
                    .setLabel("Utility")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("help-moderation")
                    .setLabel("Moderation")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("help-leveling")
                    .setLabel("Leveling")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel("Manual")
                    .setStyle(ButtonStyle.Link)
                    .setURL("https://aria-docs.littie.xyz")
            ])
        ]
        // @ts-ignore
        interaction.reply({ embeds: [embed], components })
    }
}