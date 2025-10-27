import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags } from "discord.js";
import { blacklist } from "../bot_modules/blacklist";


export default {
    data: new SlashCommandBuilder()
        .setName("blacklist")
        .setDescription("Blacklist a user by ID")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName("id").setDescription("ID of the user").setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        const ID = interaction.options.getString("id", true);

        await blacklist(ID);

        return interaction.reply({content: "✅ User blacklisted.", flags: MessageFlags.Ephemeral});
    }
}