import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, MessageFlags, Message } from "discord.js";
import cooldowns from "../bot_modules/cooldowns";
import economy from "../bot_modules/economy";
import jobModule from "../bot_modules/job";
import fs from "fs";
import path from "path";
import ms from "ms";
import { getRep, addRep } from "../bot_modules/reputation";

export default {
    data: new SlashCommandBuilder()
        .setName("job").setDescription("Job commands")
        .addSubcommand(sub => sub.setName("apply").setDescription("Apply for a job"))
        .addSubcommand(sub => sub.setName("see").setDescription("See your current job"))
        .addSubcommand(sub => sub.setName("quit").setDescription("Quit your job"))
        .addSubcommand(sub => sub.setName("shift").setDescription("Do your job and get paid"))
        .addSubcommand(sub => sub.setName("list").setDescription("See the list of jobs per category.")),

    async execute(interaction: ChatInputCommandInteraction) {
        const sub = interaction.options.getSubcommand();

        if(!interaction.guild) return;

        if(sub === "apply") {
            const file = path.join(__dirname, "../bot_data/jobs.json");

            const jobsData = JSON.parse(fs.readFileSync(file, "utf8"));

            const categories = Object.keys(jobsData);

            const embed = new EmbedBuilder()
                .setTitle("Choose a category...")
                .setDescription(
                    categories.map(cat => `- ${cat}`).join("\n")
                )
                .setColor(0xfedfe1);

            const categoryRow = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("category_select")
                    .setPlaceholder("Select a category here...")
                    .addOptions(
                        categories.map(cat => ({
                            label: cat,
                            value: cat
                        }))
                    )
            ).toJSON();

            const reply = await interaction.reply({
                embeds: [embed],
                components: [categoryRow]
            });

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60_000
            });

            collector.on("collect", async (i) => {
                if(i.user.id !== interaction.user.id) return interaction.reply({
                    content: "❌ This menu is not for you.",
                    flags: MessageFlags.Ephemeral
                });

                if(i.customId === "category_select") {
                    const chosenCategory = i.values[0] as keyof typeof jobsData;
                    const jobs = jobsData[chosenCategory] as {name: string, daily: number, requiredReputation: number}[];

                    const embed2 = new EmbedBuilder()
                        .setTitle("Select a job")
                        .setDescription(
                            jobs.map(job => `- ${job.name} -- Required rep: ${job.requiredReputation}`).join("\n")
                        )
                        .setColor(0xfedfe1);

                        const category = chosenCategory.toString()
                    
                    const jobRow = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`job_select_${category}`)
                            .setPlaceholder("Select a job...")
                            .addOptions(
                                jobs.map(job => ({
                                    label: job.name,
                                    value: job.name
                                }))
                            )
                    ).toJSON();

                    return i.update({embeds: [embed2], components: [jobRow]});

                };


                if(i.customId.startsWith("job_select_")) {
                    const choice = i.values[0];
                    const category = i.customId.replace("job_select_", "") as keyof typeof jobsData;
                    const jobs = jobsData[category] as {name: string, daily: number, requiredReputation: number}[];

                    const job = jobs.find(j => j.name === choice);

                    const requiredRep: number = job!.requiredReputation;

                    const userRep: number = getRep(i.user.id);

                    if(userRep < requiredRep) {
                        return i.update({
                            content: `❌ You don't have enough reputation points to access this job.\nYou need ${requiredRep} reputation points in total to be eligible for this job.`,
                            embeds: [],
                            components: []
                        });
                    };

                    await jobModule.setJob(i.user.id, job!.name, job!.daily);

                    const embed3 = new EmbedBuilder()
                        .setTitle("🤝 Congrats!")
                        .setDescription(`You are now working as ${job!.name}.\nQuick reminders: You have 24 hours to do your first shift (use /job shift). Or you will be fired.\nEvery time you do a shift, you get your daily pay of JPY${job!.daily.toLocaleString()}. Then there is a cooldown of 24 hours. After the cooldown is over, you have 24 hours to do your next shift or else you get fired.`)
                        .setColor(0xfedfe1)
                        .setTimestamp();

                    await cooldowns.setCooldown(i.user.id, "shift", 0);

                    return i.update({embeds: [embed3], components: []});
                };
            });

            collector.on("end", async () => {
                try {
                    await reply.edit({
                        components: []
                    })
                } catch {}
            }) 

            
        } // end of sub apply;

        if(sub === "see") {
            const job = jobModule.getJob(interaction.user.id) as {
                job: boolean,
                name: string,
                daily: number
            };

            const cooldown: number = cooldowns.getCooldown(interaction.user.id, "shift");

            if(!job.job) {
                return interaction.reply({
                    content: "❌ You don't have a job.",
                    flags: MessageFlags.Ephemeral
                });
            };

            const member = await interaction.guild.members.fetch(interaction.user.id)!;
            const embed = new EmbedBuilder()
                .setTitle("Your job")
                .setThumbnail(member.displayAvatarURL({size: 512}))
                .setDescription(`Currently you work as ${job.name}\n\nYour daily paycheck is:\nJPY${job.daily.toLocaleString()}\n\nNext shift available <t:${Math.floor(cooldown / 1000)}:R>`)
                .setColor(0xfedfe1)
                .setTimestamp();

            return interaction.reply({
                embeds: [embed]
            });
        }; // end of sub see;

        if(sub === "quit") {
            const job = jobModule.getJob(interaction.user.id) as { job: boolean, name: string, daily: number };

            if(!job.job) {
                return interaction.reply({
                    content: "❌ You don't have a job.",
                    flags: MessageFlags.Ephemeral
                });
            };

            const embed = new EmbedBuilder()
                .setTitle("Job quit")
                .setDescription(`Are you sure you want to keep your job as ${job.name}?\nType \`CONFIRM\` in the chat within the next 30 seconds to confirm.`)
                .setColor(0xfedfe1);

            await interaction.reply({
                embeds: [embed]
            });

            /* @ts-ignore*/
            const filter = msg => 
                msg.author.id === interaction.user.id && msg.content.toUpperCase() === "CONFIRM";

            const collector = interaction.channel!.createMessageComponentCollector({
                filter,
                time: 30_000,
                max: 1
            });

            collector.on("collect", async msg => {
                const message = await msg.channel!.messages.fetch(msg.id)!;
                await message.delete();
                await jobModule.removeJob(interaction.user.id);
                const embed2 = new EmbedBuilder()
                    .setTitle("🤝 Thanks for your hard work")
                    .setDescription("You are now unemployed.")
                    .setColor(0xfedfe1);

                await interaction.followUp({
                    embeds: [embed2]
                });
            });

            collector.on("end", async collected => {
                if(collected.size === 0) {
                    await interaction.followUp({
                        content: "❌ Operation cancelled.",
                        embeds: []
                    });
                };
            });
        }; // end of sub quit;


        if(sub === "shift") {
            const job = jobModule.getJob(interaction.user.id) as { job: boolean, name: string, daily: number };
            const cooldown: number = cooldowns.getCooldown(interaction.user.id, "shift");

            if(!job.job) {
                return interaction.reply({content: "❌ You don't have a job.", flags: MessageFlags.Ephemeral});
            };

            if(cooldown > Date.now()) {
                return interaction.reply({content: `❌ You worked already in the last 24 hours! Next available shift: <t:${Math.floor(cooldown / 1000)}:R>`, flags: MessageFlags.Ephemeral});
            };

            const amount = job.daily;

            await economy.addBalance(interaction.user.id, amount);

            const member = await interaction.guild.members.fetch(interaction.user.id)!;

            const embed = new EmbedBuilder()
                .setTitle("✅ Good job!")
                .setDescription(`Thanks for your hard work! Here is your JPY${amount.toLocaleString()} day pay!`)
                .setColor(0xfedfe1)
                .setThumbnail(member.displayAvatarURL({size: 512}))
                .setTimestamp();

            await cooldowns.setCooldown(interaction.user.id, "shift", ms("24 hours"));

            return interaction.reply({embeds: [embed]});
        }; // end of sub shift;

        if(sub === "list") {
            const file = path.join(__dirname, "../bot_data/jobs.json");

            const jobsData = JSON.parse(fs.readFileSync(file, "utf8"));
            const categories = Object.keys(jobsData);

            const embed = new EmbedBuilder()
                .setTitle("Categories list.")
                .setDescription(
                    categories.map(cat => `- ${cat}`).join("\n")
                )
                .setColor(0xfedfe1);

            const categoryRow = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("category")
                    .setPlaceholder("Select a category...")
                    .addOptions(
                        categories.map(cat => ({
                            label: cat,
                            value: cat
                        }))
                    )
            ).toJSON();


            const reply = await interaction.reply({
                embeds: [embed], components: [categoryRow]
            });


            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60_000
            });

            collector.on("collect", async (i) => {
                const category = i.values[0] as keyof typeof jobsData;

                const cat = category.toString()

                const jobs = jobsData[category] as { name: string, daily: number, requiredReputation: number}[];

                const embed2 = new EmbedBuilder()
                    .setTitle(`Jobs from category: ${cat}`)
                    .setDescription(
                        jobs.map(job => `- Name: ${job.name}, Daily pay: JPY${job.daily.toLocaleString()}, Required reputation points: ${job.requiredReputation}`).join("\n")
                    )
                    .setColor(0xfedfe1)
                    .setFooter({text: "Use /job apply to apply to a job."})
                    .setTimestamp();

                await i.update({embeds: [embed2], components: []});
            });

            collector.on("end", async () => {
                try {
                    await interaction.followUp({components: []});
                } catch {}
            })
        }; // end of sub list;
    }
}