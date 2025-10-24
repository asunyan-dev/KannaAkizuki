import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, MessageFlags, EmbedBuilder } from "discord.js";
import loan from "../bot_modules/loan";
import economy from "../bot_modules/economy";
import ms from "ms";

export default {
    data: new SlashCommandBuilder()
        .setName("loan").setDescription("Commands related to loans")
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(sub => sub.setName("apply").setDescription("Apply for a loan").addIntegerOption(option => 
            option.setName("amount").setDescription("The amount you apply for").setRequired(true)
            .addChoices(
                {name: "100,000JPY", value: 100000},
                {name: "200,000JPY", value: 200000},
                {name: "500,000JPY", value: 500000},
                {name: "1,000,000JPY", value: 1000000},
                {name: "2,000,000JPY", value: 2000000},
                {name: "5,000,000JPY", value: 5000000}
            )
        ))
        .addSubcommand(sub => sub.setName("info").setDescription("Get info on loan system"))
        .addSubcommand(sub => sub.setName("see").setDescription("See your loan status")),

    async execute(interaction: ChatInputCommandInteraction) {
        if(!interaction.guild) return;
        const sub = interaction.options.getSubcommand();

        if(sub === "apply") {
            const amount = interaction.options.getInteger("amount", true);

            const balance: number = economy.getBalance(interaction.user.id);

            const loanUser = loan.getLoan(interaction.user.id);

            if(loanUser.loan) {
                return interaction.reply({
                    content: "❌ You already have an ongoing loan.",
                    flags: MessageFlags.Ephemeral
                });
            };

            const requiredAmount = Math.floor(amount / 2);

            if(balance < requiredAmount) {
                return interaction.reply({
                    content: "❌ You can't apply for this loan. You don't meet the requirements for it. Use /loan info for more info.",
                    flags: MessageFlags.Ephemeral
                });
            };

            await economy.addBalance(interaction.user.id, amount);
            const newAmount = Math.floor((5 / 100) * amount);
            const totalLoan  = Math.floor(amount + newAmount);
            const nextDue = Math.floor(Date.now() + ms("1day"));
            await loan.addLoan(interaction.user.id, totalLoan, nextDue, totalLoan);

            const rate = Math.floor(totalLoan / 30);

            const embed = new EmbedBuilder()
                .setTitle("🤝 Thank you for choosing Kanna Bank!")
                .setDescription(`Your loan was accepted!\n\nWe have added ${amount.toLocaleString()}JPY to your account.\n\n**Your contract:**\nFor the next 30 days, you will be debited JPY${rate} per day (You pay in total the amount of the loan, plus 5% of the total). Make sure you have the funds for the daily debit.`)
                .setColor(0xfedfe1)
                .setTimestamp();

            return interaction.reply({embeds: [embed]});
        };

        if(sub === "info") {
            const embed = new EmbedBuilder()
                .setTitle("ℹ Loan information")
                .setDescription("To apply to a loan, you must have half the amount you're requesting on your account.\nThe interest rate is 5% and you refund the loan every day for 30 days.\nBe careful, the bank will debit you even if you don't have enough funds.")
                .setColor(0xfedfe1)
                .setTimestamp();

            return interaction.reply({embeds: [embed]});
        };

        if(sub === "see") {
            const loanUser = loan.getLoan(interaction.user.id);

            if(!loanUser.loan) {
                return interaction.reply({
                    content: "You don't have any loan ongoing right now.",
                    flags: MessageFlags.Ephemeral
                });
            };

            const timestamp = Math.floor(loanUser.nextDue / 1000);

            const embed = new EmbedBuilder()
                .setTitle("Your loan")
                .setDescription(`**Total to refund:**\nJPY${loanUser.amount.toLocaleString()}\n\n**Rest to refund as of today:**\nJPY${loanUser.due.toLocaleString()}\n\n**Next debit on your account:**\n<t:${timestamp}:R> (approximately)`)
                .setColor(0xfedfe1)
                .setTimestamp();

            return interaction.reply({embeds: [embed]});
        }
    }
}