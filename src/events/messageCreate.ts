import { Message, EmbedBuilder, Client, Events } from "discord.js"
import afk from "../bot_modules/afk"
import economy from "../bot_modules/economy"
import botLogs from "../bot_modules/botLogs"
import loan from "../bot_modules/loan"
type ms = any
import ms from "ms"
import job from "../bot_modules/job"
import cooldowns from "../bot_modules/cooldowns"
import sendMessage from "../bot_modules/sendMessage"
import ids from "../ids.json"

export default {
    name: Events.MessageCreate,

    async execute(message: Message, client: any) {
        if(message.author.bot) return;
        if(!message.guild) return;
        if(!message.member) return;

        let lulAmount;

        if(message.member.premiumSince) {
            lulAmount = Math.floor(Math.random() * 4 - 2 + 1) + 2;
        } else {
            lulAmount = Math.floor(Math.random() * 2 - 1 + 1) + 1;
        };

        economy.addLuls(message.author.id, lulAmount);

        const afkStatus = await afk.getAfk(message.author.id);

        if(afkStatus.afk) {
            afk.removeAfk(message.author.id);
            const embed = new EmbedBuilder()
                .setTitle("👋 Okaeri!")
                .setDescription("I removed your AFK status.")
                .setColor(0xfedfe1)
                .setThumbnail(message.member.displayAvatarURL({size: 512}))
                .setTimestamp();
            message.reply({embeds: [embed]});
        };

        if(message.mentions?.users.size > 0) {
            message.mentions.users.forEach((user) => {
                const status = afk.getAfk(user.id);
                if(status.afk) {
                    message.reply({
                        content: `💤 ${user.tag} is AFK:\n${status.reason || "AFK"}`
                    });
                };
            });
        };

        const work = job.getJob(message.author.id);

        if(work.job) {
            const cooldown = cooldowns.getCooldown(message.author.id, "shift");
            const extendedCooldown = Math.floor(cooldown + ms("1 day"));
            if(Date.now() > extendedCooldown) {
                await job.removeJob(message.author.id);
                const embed = new EmbedBuilder()
                    .setTitle("😡 You're fired!")
                    .setDescription(`You were supposed to do your shift before <t:${Math.floor(extendedCooldown / 1000)}:R>. You're now unemployed.`)
                    .setColor(0xfedfe1)
                    .setThumbnail(message.member.displayAvatarURL({size: 512}))
                    .setFooter({text: "Use /job apply to apply to a new job."})
                    .setTimestamp();
                message.reply({
                    content: `<@${message.author.id}>`,
                    embeds: [embed]
                });
            };
        };


        const loanStatus = loan.getLoan(message.author.id);


        if(loanStatus.loan) {
            const cooldown = loanStatus.nextDue;
            const totalAmountDue = loanStatus.amount;
            const restDue = loanStatus.due;

            const rate = Math.floor(totalAmountDue / 30);

            if(cooldown < Date.now()) {
                const newDue = Math.floor(restDue - rate);
                let amountRemoved;

                if(newDue <= 0) {
                    amountRemoved = restDue;
                    await economy.removeBalance(message.author.id, amountRemoved);
                    await loan.endLoan(message.author.id);

                    const embed = new EmbedBuilder()
                        .setTitle("🤝 End of your loan")
                        .setDescription(`You refunded all of your loan, congrats! The last JPY${amountRemoved.toLocaleString()} were debited from your account. You can now apply to a new loan, and if you meet the requirements, it will be accepted!`)
                        .setColor(0xfedfe1)
                        .setTimestamp();

                    sendMessage(client, message.channel.id, {
                        content: `<@${message.author.id}>`, embeds: [embed]
                    });
                } else {
                    amountRemoved = rate;
                    const nextDue = Math.floor(Date.now() + ms("1 day"));
                    await economy.removeBalance(message.author.id, amountRemoved);
                    await loan.editNextDue(message.author.id, nextDue);
                    await loan.editDue(message.author.id, newDue);

                    const embed = new EmbedBuilder()
                        .setTitle("❗ Daily loan debit")
                        .setDescription(`Hello, <@${message.author.id}>, we just debited your daily due from your your account.\n\nWe have debited JPY${amountRemoved.toLocaleString()}.\nYou still have JPY${newDue.toLocaleString()} to pay.\n\nThank you for choosing KannaBank for your loan!`)
                        .setColor(0xfedfe1)
                        .setThumbnail(message.member.displayAvatarURL({size: 512}))
                        .setTimestamp();
                    message.reply({
                        embeds: [embed]
                    });
                };
            };
        };

        if(message.content.toLowerCase().includes("kanna throw geta")) {
            sendMessage(client, message.channel.id, {
                stickers: [client.guilds.cache.get(ids.guilds.kannacord)!.stickers.cache.get(ids.stickers.throwgeta)!]
            });
        };

        if(message.content.toLowerCase() === "kanna what's new?") {
            const allLogs: { version: string, details: string}[] = botLogs.getLogs();

            const length = allLogs.length;
            if(length === 0) {
                return message.reply({
                    content: "❌ There is no changelog yet!"
                });
            };

            const log = allLogs[length - 1];
            const embed = new EmbedBuilder()
                .setTitle(`${client.user!.tag} - Version: ${log.version}`)
                .setDescription(`**Details:**\n${log.details}`)
                .setColor(0xfedfe1)
                .setFooter({text: `Kanna Akizuki v${log.version}`})
                .setTimestamp()
                .setThumbnail(client.user!.avatarURL({size: 512}));

            message.reply({embeds: [embed]});
        };


        if(!message.reference) return;

        if(message.content.toLowerCase() === "kanna emoji" && message.guild.id === ids.guilds.kannacord) {
            const fetched = await message.channel.messages.fetch(message.reference.messageId!)
            if(!fetched) return;

            const customEmojiRegex = /<a?;\w+:\d+>/g;

            const found = fetched.content.match(customEmojiRegex);

            if(found) {
                found.forEach(e => {
                    const parsed = e.match(/<(a?):(\w+):(\d+)>/);
                    const animated = parsed![1] === "a";
                    const name = parsed![2];
                    const id = parsed![3];

                    return message.reply({
                        content: `Emoji name: \`${name}\`\nEmoji ID: \`${id}\`\nhttps://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}`
                    });
                })
            } else {
                return message.reply({
                    content: "❌ No emoji found."
                });
            };
        };

        if(message.content.toLowerCase().startsWith("kanna translate")) {
            const replied = await message.channel.messages.fetch(message.reference.messageId!);
            if(!replied) return;

            const member = await message.guild.members.fetch(replied.author.id).catch(() => null);
            if(!member) return;

            try {
                const text = replied.content;

                const res = await fetch(`https://api.popcat.xyz/v2/translate?to=en&text=${encodeURIComponent(text)}`);
                if(!res.ok) {
                    return message.reply({
                        content: "❌ There was an error with the API, please try again later."
                    });
                };

                const data = await res.json() as {
                    error: boolean,
                    message: {
                        translated: string,
                        error: string | null
                    }
                };

                if(data.error) {
                    return message.reply(`❌ ${data.message.error}`);
                };

                return message.reply(`${member.displayName} meant:\n${data.message.translated}`);
            } catch (error) {
                console.error(error);
                return message.reply({
                    content: "❌ There was an error with the API, please try again later."
                })
            }
        }
        
    }
}