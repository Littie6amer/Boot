import { CacheType, Interaction, ModalSubmitInteraction, EmbedBuilder } from "discord.js";
import { Client, ClientEventBase } from "indigo-client";

export default class InteractionCreateEvent extends ClientEventBase {
    constructor(client: Client) {
        super(client, {
            name: "interactionCreate",
        })
    }

    execute(interaction: Interaction): any {
        if (!interaction.isModalSubmit()) return
        const args = interaction.customId.split(":")
        // @ts-ignore
        this[args[0]](interaction, args[1])
    }

    async chatCreate(interaction: ModalSubmitInteraction<CacheType>, categoryId: string) {
        // const name = interaction.fields.getTextInputValue("name")
        const topic = interaction.fields.getTextInputValue("topic")
        const channel = await interaction.guild?.channels.create({ name: "man-idk", topic, parent: categoryId === "undefined" ? undefined : categoryId })
        if (!channel) return;
        const embeds = [
            new EmbedBuilder()
                .setDescription(`**Created channel ${channel}**`)
                .setColor(this.client.embedColor)
        ]
        interaction.reply({ embeds })

        embeds[0] = new EmbedBuilder()
            .setColor("#a662e9")
            .setTitle(`<a:star_purple:1023665925527978045> #${channel.name}`)
            .setURL(channel.url)
            .setDescription(channel.topic || "This channel has no topic!")
            .setFields([
                { name: "Type", value: "Chat", inline: true },
                { name: "Created", value: `<t:${Math.floor(channel.createdAt.getTime()/1000)}:D>`, inline: true },
                { name: "Slowmode", value: `${channel.rateLimitPerUser || "None"}` }
            ])
        embeds.push(
            new EmbedBuilder()
                .setColor("#859dfc")
                .setTitle(`Channel Activity`)
                // .setURL(channel.url)
                .setDescription(`<:blue_dot:936976233575616532> 0 messages sent\n<:blue_dot:936976233575616532> 0 unique chatters`)
                .setFields([
                    // { name: "Channel Activity", value: `<:blue_dot:936976233575616532> 0 messages sent\n<:blue_dot:936976233575616532> 0 unique chatters` },
                    { name: "Top Chatters This Week", value: "No one has sent a message yet!" },
                    { name: "Top Chatters Last Week", value: "No one has sent a message yet!" },
                ])
                .setFooter({ text: "Spam messages are not counted!\nUpdates every 10 minutes."})
        );
        channel.send({ embeds: [embeds[0]] }).then(m => m.pin())
        return channel.send({ embeds: [embeds[1]] }).then(m => m.pin())
    }
}