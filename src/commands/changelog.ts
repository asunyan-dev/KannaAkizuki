import { ChatInputCommandInteraction, ModalBuilder, SlashCommandBuilder, ComponentType, PermissionFlagsBits, InteractionContextType, TextInputStyle, MessageFlags, LabelBuilder, TextInputBuilder } from "discord.js";
import ids from "../ids.json";

export default {
    data: new SlashCommandBuilder()
        .setName("changelog").setDescription("Push a new Changelog for the bot").setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction: ChatInputCommandInteraction) {
        if(interaction.user.id !== ids.users.asuka) {
            return interaction.reply({
                content: "❌ This command is dev-only.",
                flags: MessageFlags.Ephemeral
            });
        };

        const modal = new ModalBuilder()
            .setCustomId("changelog")
            .setTitle("New Changelog")
            .addLabelComponents(
                new LabelBuilder()
                    .setLabel("Version")
                    .setDescription("Set the version of the bot")
                    .setTextInputComponent(
                        new TextInputBuilder()
                            .setCustomId("version")
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder("Type bot version here")
                            .setRequired(true)
                    ),
                new LabelBuilder()
                    .setLabel("Details")
                    .setDescription("Set the details of the new version")
                    .setTextInputComponent(
                        new TextInputBuilder()
                            .setCustomId("details")
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder("Type all details here...")
                            .setRequired(true)
                    )
            );

        await interaction.showModal(modal);
    }
}