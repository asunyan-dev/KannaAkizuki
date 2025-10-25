import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags, EmbedBuilder, InteractionContextType } from "discord.js";
import fetchURL from "../bot_modules/fetch";

export default {
    data: new SlashCommandBuilder()
        .setName("translate").setDescription("Translate provided text")
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option => 
            option.setName("text").setDescription("Your text").setRequired(true)
        )
        .addStringOption(option => 
            option.setName("language").setDescription("The target language")
            .setRequired(true)
            .addChoices(
                { name: "English", value: "en" },
                { name: "Spanish", value: "es" },
                { name: "French", value: "fr" },
                { name: "German", value: "de" },
                { name: "Italian", value: "it" },
                { name: "Portuguese", value: "pt" },
                { name: "Russian", value: "ru" },
                { name: "Japanese", value: "ja" },
                { name: "Korean", value: "ko" },
                { name: "Chinese (Simplified)", value: "zh-cn" },
                { name: "Chinese (Traditional)", value: "zh-tw" },
                { name: "Arabic", value: "ar" },
                { name: "Hindi", value: "hi" },
                { name: "Turkish", value: "tr" },
                { name: "Dutch", value: "nl" },
                { name: "Greek", value: "el" },
                { name: "Polish", value: "pl" },
                { name: "Swedish", value: "sv" },
                { name: "Filipino", value: "tl" }
            )
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        
    }
}