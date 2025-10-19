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
            };

            if(sub === "balance") {
                const user = interaction.options.getUser("user") || interaction.user;

                const member = await interaction.guild!.members.fetch(user.id);

                const balance: number = economy.getBalance(user.id);

                const embed = new EmbedBuilder()
                    .setTitle("Balance")
                    .setAuthor({
                        name: member?.displayName ?? user.displayName,
                        iconURL: member?.displayAvatarURL({size: 128}) ?? user.avatarURL({size: 128})
                    })
                    .setDescription(`### JPY${balance.toLocaleString()}`)
                    .setColor(0xfedfe1)
                    .setTimestamp()
                    .setFooter({text: "Use /economy account to see your KannaLuls."});

                return interaction.reply({embeds: [embed]});
            };

            if(sub === "leaderboard") {
                const file = path.join(__dirname, "../bot_data/economy.json");

                if(!fs.existsSync(file)) {
                    return interaction.reply({
                        content: "❌ No economy data found",
                        flags: MessageFlags.Ephemeral
                    });
                };

                const data = JSON.parse(fs.readFileSync(file, "utf8"));

                const sorted = Object.entries(data)
                    .map(([id, user]) => {
                        const u = user as { balance?: number, luls?: number };
                        return { id, balance: u.balance || 0, luls: u.luls || 0 };
                    })
                    .sort((a, b) => b.balance - a.balance)
                    .slice(0, 10);

                if(sorted.length === 0) {
                    return interaction.reply({
                        content: "❌ Nobody has money yet",
                        flags: MessageFlags.Ephemeral
                    });
                };

                const embed = new EmbedBuilder()
                    .setTitle("🏆 Leaderboard - Top 10 richest users")
                    .setThumbnail(interaction.guild!.iconURL({size: 512}))
                    .setDescription(sorted.map((u, i) => `${i + 1}. - <@${u.id}>\nBalance: ${u.balance.toLocaleString()}\nKannaLuls: ${u.luls.toLocaleString()}`).join("\n\n"))
                    .setColor(0xfedfe1)
                    .setTimestamp();

                return interaction.reply({
                    embeds: [embed]
                });

                
            };
        }; // end of group "info"


        if(group === "bet") {

            if(sub === "coinflip") {
                const member = await interaction.guild!.members.fetch(interaction.user.id);
                const userId = interaction.user.id;

                const choice: string = interaction.options.getString("choice", true);

                const bet: number = interaction.options.getInteger("amount", true);

                if(choice !== "heads" && choice !== "tails") {
                    return interaction.reply({
                        content: "❌ Invalid choice! Please choose heads or tails!",
                        flags: MessageFlags.Ephemeral
                    });
                };

                if(bet <= 0) {
                    return interaction.reply({
                        content: "❌ Bet must be greater than 0.",
                        flags: MessageFlags.Ephemeral
                    });
                };

                const balance: number = economy.getBalance(userId);

                if(balance < bet) {
                    return interaction.reply({
                        content: `❌ You don't have enough money!! You currently have JPY${balance.toLocaleString()}.`,
                        flags: MessageFlags.Ephemeral
                    });
                };

                let side = Math.random() < 0.5 ? "heads" : "tails";

                let resultEmbed = new EmbedBuilder()
                    .setTitle("🌸 Coin flip result")
                    .setColor(0xfedfe1)
                    .setTimestamp()
                    .setThumbnail(member?.displayAvatarURL({size: 512}) ?? interaction.user.avatarURL({size: 512}));

                if(side === choice) {
                    const winnings = bet * 2;
                    await economy.addBalance(userId, bet);
                    resultEmbed.setDescription(`🎉 It landed on ${side}!!! Congrats!\nYou earned JPY${winnings.toLocaleString()}!`);
                    return interaction.reply({
                        embeds: [resultEmbed]
                    });
                } else {
                    await economy.removeBalance(userId, bet);
                    resultEmbed.setDescription(`😢 It landed on ${side}... I'm sorry...\nYou lost JPY${bet.toLocaleString()}.`);
                    return interaction.reply({
                        embeds: [resultEmbed]
                    });
                };
            
            };
        }; // end of group bet
    }
}