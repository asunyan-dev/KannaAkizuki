import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags } from "discord.js";

import { whitelist } from "../bot_modules/blacklist";


export default {
    data: new SlashCommandBuilder()
        .setName("whitelist").setDescription("Whitelist a user by ID")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName("id").setDescription("ID of the user").setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        const ID = interaction.options.getString("id", true);

        await whitelist(ID);

        return interaction.reply({content: "✅ User whitelisted.", flags: MessageFlags.Ephemeral});
    }
}