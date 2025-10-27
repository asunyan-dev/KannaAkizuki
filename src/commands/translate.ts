import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags, EmbedBuilder, InteractionContextType } from "discord.js";
import fetchURL from "../bot_modules/fetch";

export default {
    data: new SlashCommandBuilder()
        .setName("translate").setDescription("Translate provided text")
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
        if(!interaction.guild) return;

        const text = interaction.options.getString("text", true);
        const language = interaction.options.getString("language", true);

        const res = await fetchURL(`https://api.popcat.xyz/v2/translate?to=${language}&text=${encodeURIComponent(text)}`);

        if(!res.ok) return interaction.reply({content: res.error!, flags: MessageFlags.Ephemeral});

        const data = res.data as { error: boolean, message: { error: string, translated: string } };

        if(data.error) return interaction.reply({content: `❌ ${data.message.error}`, flags: MessageFlags.Ephemeral});

        const embed = new EmbedBuilder()
            .setTitle("🈶 Translation")
            .setDescription(`**Original text:**\n${text}\n\n**Translated to ${language}:**\n${data.message.translated}`)
            .setColor(0xfedfe1)
            .setTimestamp();

        return interaction.reply({embeds: [embed]});


    }
}