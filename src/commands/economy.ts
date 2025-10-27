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
        .addSubcommandGroup(group => 
            group.setName("info").setDescription("economy info commands.")
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
            group.setName("earn").setDescription("earn money")
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
            group.setName("manage").setDescription("manage money")
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


        if(group === "earn") {

            if(sub === "daily") {
                const member = await interaction.guild!.members.fetch(interaction.user.id);
                const userId = interaction.user.id;
                const cooldown: number = cooldowns.getCooldown(userId, "daily");

                if(cooldown > Date.now()) {
                    return interaction.reply({
                        content: `❌ You already claimed your daily KannaLuls. Try again <t:${Math.floor(cooldown / 1000)}:R>.`,
                        flags: MessageFlags.Ephemeral
                    });
                };

                const luls: number = economy.getLuls(userId);

                let amount: number;

                if(member.premiumSince) {
                    amount = Math.floor(Math.random() * 150 - 75 + 1) + 75;
                } else {
                    amount = Math.floor(Math.random() * 75 - 20 + 1) + 20;
                };

                

                const embed = new EmbedBuilder()
                    .setTitle("✅ Daily KannaLuls claimed")
                    .setColor(0xfedfe1)
                    .setTimestamp()
                    .setDescription(`Today you earned ${amount.toLocaleString()} ${ids.emojis.kannalul}!`)
                    .setThumbnail(member.displayAvatarURL({size: 512}));

                await economy.addLuls(userId, amount);
                await cooldowns.setCooldown(userId, "daily", ms("24 hours"));

                return interaction.reply({embeds: [embed]});
            };

            if(sub === "sell") {
                const luls: number = economy.getLuls(interaction.user.id);
                const balance: number = economy.getBalance(interaction.user.id);

                if(luls === 0) {
                    return interaction.reply({
                        content: "❌ You don't have any KannaLuls. Chat to earn some!",
                        flags: MessageFlags.Ephemeral
                    });
                };

                let amount: number;

                const member = await interaction.guild!.members.fetch(interaction.user.id)!;

                if(member.premiumSince) {
                    amount = Math.floor(200 * luls);
                } else {
                    amount = Math.floor(100 * luls);
                };

                await economy.resetLuls(interaction.user.id);
                await economy.addBalance(interaction.user.id, amount);

                const newBalance: number = balance + amount;

                const embed = new EmbedBuilder()
                    .setTitle("✅ Sold your KannaLuls")
                    .setDescription(`**New balance:** JPY${newBalance.toLocaleString()}.`)
                    .setColor(0xfedfe1)
                    .setTimestamp();

                return interaction.reply({embeds: [embed]});
            }


            if(sub === "work") {
                const jobs = [
                    "🔨 You banned scammers",
                    "🗣 You discussed about server management",
                    "💻 You set up a new bot",
                    "☕ You made coffee for the boss",
                    "📸 You reported a user breaking the rules",
                    "🔊 You spent time in VC",
                    "💭 You gave a suggestion",
                    "🏆 You chatted a lot"
                ];

                const cooldown: number = cooldowns.getCooldown(interaction.user.id, "work");

                const member = await interaction.guild!.members.fetch(interaction.user.id)!;

                const userId = interaction.user.id;

                if(cooldown > Date.now()) {
                    return interaction.reply({
                        content: `❌ You already worked! You can work again <t:${Math.floor(cooldown / 1000)}:R>.`,
                        flags: MessageFlags.Ephemeral
                    });
                };

                const job: string = jobs[Math.floor(Math.random() * jobs.length)];

                let reward: number;

                if(member.premiumSince) {
                    reward = Math.floor(Math.random() * 45 - 30 + 1) + 30;
                } else {
                    reward = Math.floor(Math.random() * 30 - 15 + 1) + 15;
                };

                await economy.addLuls(userId, reward);

                const embed = new EmbedBuilder()
                    .setTitle("✅ Good job!")
                    .setDescription(
                        `**${job} and you earned ${reward.toLocaleString()}** ${ids.emojis.kannalul} !`
                    )
                    .setColor(0xfedfe1)
                    .setThumbnail(member.displayAvatarURL({size: 512}))
                    .setFooter({text: "You can work again in 3 hours."})
                    .setTimestamp();

                await cooldowns.setCooldown(userId, "work", ms("3 hours"));

                return interaction.reply({embeds: [embed]});
            }
        }; // end of group "earn"

        if(group === "manage") {
            if(!interaction.guild) return;
            const member = await interaction.guild.members.fetch(interaction.user.id)!
            if(!member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({
                    content: "❌ This command is admin only.",
                    flags: MessageFlags.Ephemeral
                });
            };

            if(sub === "increase-balance") {
                const user = interaction.options.getUser("user", true);
                const amount = interaction.options.getInteger("amount", true);

                if(user.id === interaction.user.id) {
                    return interaction.reply({
                        content: "❌ You can't increase your own balance, that's cheating.",
                        flags: MessageFlags.Ephemeral
                    });
                };

                if(amount <= 0) {
                    return interaction.reply({
                        content: "❌ Amount must be greater than 0.",
                        flags: MessageFlags.Ephemeral
                    });
                };

                const balance: number = economy.getBalance(user.id);

                await economy.addBalance(user.id, amount);

                const newBalance = balance + amount;

                const embed = new EmbedBuilder()
                    .setTitle("✅ Money given")
                    .setDescription(`<@${user.id}>\n\n**Before:** JPY${balance.toLocaleString()}\n\n+ ${amount.toLocaleString()}\n\n**Now:** JPY${newBalance.toLocaleString()}`)
                    .setColor(0xfedfe1)
                    .setTimestamp();

                return interaction.reply({embeds: [embed]});
            };

            if(sub === "tax") {
                const allowedUsers = [
                    ids.users.asuka,
                    ids.users.kanna
                ];

                if(!allowedUsers.includes(interaction.user.id)) {
                    return interaction.reply({
                        content: "❌ You are not allowed to use this command.",
                        flags: MessageFlags.Ephemeral
                    });
                };

                const user = interaction.options.getUser("user", true);
                const amount = interaction.options.getInteger("amount", true);

                if(amount <= 0) {
                    return interaction.reply({
                        content: "❌ Amount must be greater than 0.",
                        flags: MessageFlags.Ephemeral
                    });
                };

                const kannaBalance:number = economy.getBalance(ids.users.kanna);
                const targetBalance: number = economy.getBalance(user.id);

                const newKannaBalance = Math.floor(kannaBalance + amount);
                const newTargetBalance = Math.floor(targetBalance + amount);

                await economy.addBalance(ids.users.kanna, amount);
                await economy.removeBalance(user.id, amount);

                const kanna = await interaction.guild!.members.fetch(ids.users.kanna);
                const target = await interaction.guild!.members.fetch(user.id);

                const kannaEmbed = new EmbedBuilder()
                    .setTitle(`${kanna.displayName}`)
                    .setThumbnail(kanna.displayAvatarURL({size: 512}))
                    .setColor("Green")
                    .setDescription(`JPY${kannaBalance.toLocaleString()}\n\n+${amount.toLocaleString()}\n\n= JPY${newKannaBalance.toLocaleString()}`)
                    .setTimestamp();
                const targetEmbed = new EmbedBuilder()
                    .setTitle(target.displayName)
                    .setThumbnail(target.displayAvatarURL({size: 512}))
                    .setDescription(`JPY${targetBalance.toLocaleString()}\n\n\- ${amount.toLocaleString()}\n\n= JPY${newTargetBalance.toLocaleString()}`)
                    .setColor("Red")
                    .setTimestamp();

                return interaction.reply({
                    embeds: [kannaEmbed, targetEmbed]
                });
            };

        } // end of sub "manage";

        if(sub ==="pay") {
            const user = interaction.options.getUser("user", true);
            const amount = interaction.options.getInteger("amount", true);

            const target = await interaction.guild!.members.fetch(user.id)!
            const member = await interaction.guild!.members.fetch(interaction.user.id)!

            if(amount <= 0) {
                return interaction.reply({
                    content: "❌ Amount must be greater than 0.",
                    flags: MessageFlags.Ephemeral
                });
            };

            const memberBalance: number = economy.getBalance(interaction.user.id);
            const targetBalance: number = economy.getBalance(user.id);

            if(memberBalance < amount) {
                return interaction.reply({
                    content: "❌ You don't have enough money.",
                    flags: MessageFlags.Ephemeral
                });
            };

            const memberNewBalance = memberBalance - amount;
            const targetNewBalance = targetBalance + amount;

            await economy.addBalance(user.id, amount);
            await economy.removeBalance(interaction.user.id, amount);


            const memberEmbed = new EmbedBuilder()
                .setTitle(member.displayName)
                .setThumbnail(member.displayAvatarURL({size: 512}))
                .setColor("Red")
                .setDescription(`JPY${memberBalance.toLocaleString()}\n\n\- ${amount.toLocaleString()}\n\n= JPY${memberNewBalance.toLocaleString()}`)
                .setTimestamp();

            const targetEmbed = new EmbedBuilder()
                .setTitle(target.displayName)
                .setThumbnail(target.displayAvatarURL({size: 512}))
                .setColor("Green")
                .setDescription(`JPY${targetBalance.toLocaleString()}\n\n+ ${amount.toLocaleString()}\n\n= JPY${targetNewBalance.toLocaleString()}`)
                .setTimestamp();

            return interaction.reply({embeds: [memberEmbed, targetEmbed]});
        }
    }
}