import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, EmbedBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";
import economy from "../bot_modules/economy";
import cooldowns from "../bot_modules/cooldowns";
import ms from "ms";
import fs from "fs";
import path from "path";
import ids from "../ids.json";

export default {
    data: new SlashCommandBuilder()
        .setName("economy").setDescription("Economy Commands.")
        .setContexts(InteractionContextType.Guild)
        .addSubcommandGroup(group => 
            group.setName("info")
            .addSubcommand(sub => 
                sub.setName("account")
                .setDescription("Get a user's economy data.")
                .addUserOption(option => 
                    option.setName("user")
                    .setDescription("Choose a user.")
                    .setRequired(false)
                )
            )
            .addSubcommand(sub => 
                sub.setName("balance").setDescription("See a user's money balance.")
                .addUserOption(option => 
                    option.setName("user").setDescription("User to see balance for").setRequired(false)
                )
            )
            .addSubcommand(sub => 
                sub.setName("leaderboard").setDescription("See the top 10 richest users")
            )
        )
        .addSubcommandGroup(group => 
            group.setName("bet").setDescription("Bet money on games")
            .addSubcommand(sub => 
                sub.setName("coinflip").setDescription("Bet on heads or tails")
                .addStringOption(option => 
                    option.setName("choice").setDescription("Make your choice!")
                    .addChoices(
                        { name: "Heads", value: "heads" },
                        { name: "Tails", value: "tails" }
                    )
                    .setRequired(true)
                )
                .addIntegerOption(option => 
                    option.setName("amount").setDescription("The amount to bet").setRequired(true)
                )

            )
        )
        .addSubcommandGroup(group => 
            group.setName("earn")
            .addSubcommand(sub => 
                sub.setName("daily").setDescription("Get your daily KannaLuls")
            )
            .addSubcommand(sub => 
                sub.setName("sell").setDescription("Sell your KannaLuls.")
            )
            .addSubcommand(sub => 
                sub.setName("work").setDescription("Work and get KannaLuls.")
            )
        )
        .addSubcommandGroup(group => 
            group.setName("manage")
            .addSubcommand(sub => 
                sub.setName("increase-balance").setDescription("increase a user balance")
                .addUserOption(option => 
                    option.setName("user").setDescription("The user to increase balance").setRequired(true)
                )
                .addIntegerOption(option => 
                    option.setName("amount").setDescription("Amount to give").setRequired(true)
                )
            )
            .addSubcommand(sub => 
                sub.setName("tax").setDescription("TIS TAX TIME")
                .addUserOption(option => 
                    option.setName("user").setDescription("The user to tax").setRequired(true)
                )
                .addIntegerOption(option => 
                    option.setName("amount").setDescription("Amount to tax").setRequired(true)
                )
            )
        )
        .addSubcommand(sub => 
            sub.setName("pay").setDescription("Transfer money to another user.")
            .addUserOption(option => 
                option.setName("user").setDescription("Target user").setRequired(true)
            )
            .addIntegerOption(option => 
                option.setName("amount").setDescription("Amount to transfer").setRequired(true)
            )
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const group = interaction.options.getSubcommandGroup();
        const sub = interaction.options.getSubcommand();
        

        if(group === "info") {
            if(sub === "account") {
                const user = interaction.options.getUser("user") || interaction.user;

                const member = await interaction.guild?.members.fetch(user.id);

                const money: number = economy.getBalance(user.id);
                const luls: number = economy.getLuls(user.id);

                const kannalul: string = ids.emojis.kannalul;
                
                const embed = new EmbedBuilder()
                    .setTitle(`⭐ ${member?.displayName ?? user.displayName}'s Account`)
                    .setThumbnail(member?.displayAvatarURL({size: 512}) ?? user.avatarURL({size: 512}))
                    .setColor(0xfedfe1)
                    .setTimestamp()
                    .setDescription(`**Money Balance:**\n→ JPY${money.toLocaleString()}\n\n**KannaLul Balance:**\n→ ${luls.toLocaleString()} ${kannalul}`);

                return interaction.reply({
                    embeds: [embed]
                });
            }
        } // end of group "info"
    }
}