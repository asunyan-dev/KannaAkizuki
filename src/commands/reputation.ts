import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, MessageFlags } from "discord.js";
import cooldowns from "../bot_modules/cooldowns";
import ms from "ms";
import { addRep, getRep } from "../bot_modules/reputation";

export default {
    data: new SlashCommandBuilder()
        .setName("reputation").setDescription("Give a reputation point to another user")
        .setContexts(InteractionContextType.Guild)
        .addUserOption(o => o.setName("user").setDescription("The user to give a rep point to").setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {

        if(!interaction.guild) return;

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if(!member) return;

        const cooldown: number = cooldowns.getCooldown(interaction.user.id, "reputation");

        if(cooldown > Date.now()) {
            return interaction.reply({content: `❌ You already gave your daily reputation point! Try again <t:${Math.floor(cooldown / 1000)}:R>.`, flags: MessageFlags.Ephemeral});
        };

        const user = interaction.options.getUser("user", true);

        const target = await interaction.guild.members.fetch(user.id).catch(() => null);

        if(!target) {
            return interaction.reply({content: "❌ Couldn't find user in the server.", flags: MessageFlags.Ephemeral});
        };

        if(target.id === member.id) {
            return interaction.reply({content: "❌ You can't give a reputation point to yourself!", flags: MessageFlags.Ephemeral});
        };

        const rep = getRep(target.id);
        await addRep(target.id);

        const newRep = rep + 1;

        await cooldowns.setCooldown(interaction.user.id, "reputation", ms("1 day"));

        return interaction.reply({
            content: `✅ Successfully given a reputation point to <@${target.id}>! They now have ${newRep} reputation points!`
        })
    }

}