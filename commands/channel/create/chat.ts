import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { Client, SlashCommandBase } from "indigo-client";
import { CommandContext } from "indigo-client/build/bases/CommandContext";

export default class SubCommand extends SlashCommandBase {
    constructor(client: Client) {
        super(client, {
            name: "chat",
            description: "Create a channel for chatting",
            options: [
                {
                    name: "name",
                    type: "STRING",
                    description: "The name of the chat",
                },
                {
                    name: "category",
                    type: "CHANNEL",
                    description: "The category this channel will be placed under",
                    channel_types: ["GUILD_CATEGORY"]
                }
            ],
        })
    }

    execute(ctx: CommandContext) {
        const {interaction} = ctx
        function actionRow(textinput: TextInputBuilder) {
            return new ActionRowBuilder().setComponents(textinput)
        }
        const category = interaction.options.get("category") 
        const name = interaction.options.get("name")
        const topic = new TextInputBuilder()
            .setCustomId("topic")
            .setLabel("Chat Topic")
            .setPlaceholder("What the chat is about")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        const memberRole = new TextInputBuilder()
            .setCustomId("member")
            .setLabel("Chat Member Role")
            .setPlaceholder("Which role can talk in the chat")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        const specialRole = new TextInputBuilder()
            .setCustomId("special")
            .setLabel("Chat Special Role")
            .setPlaceholder("Which role will get fun permissions in this channel")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        const cooldown = new TextInputBuilder()
            .setCustomId("cooldown")
            .setLabel("Chat Cooldown")
            .setPlaceholder("The cooldown for the chat")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        const chatModel = new ModalBuilder()
            .setCustomId("chatCreate:"+category?.value||"")
            .setTitle("#"+(name?.value||""))
            // @ts-ignore
            .setComponents(actionRow(topic), actionRow(memberRole), actionRow(specialRole), actionRow(cooldown))

        return interaction.showModal(chatModel)
    }
}