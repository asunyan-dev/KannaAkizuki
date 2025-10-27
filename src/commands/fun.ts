import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, InteractionContextType, MessageFlags, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from "discord.js";
import path from "path";
import fetchURL from "../bot_modules/fetch";

export default {
    data: new SlashCommandBuilder()
        .setName("fun")
        .setDescription("Fun commands.")
        .addSubcommandGroup(group => 
            group.setName("interact").setDescription("interact commands")
            .addSubcommand(sub => 
                sub.setName("hug").setDescription("Hug a user")
                .addUserOption(option => 
                    option.setName("user")
                    .setDescription("User to hug")
                    .setRequired(true)
                )
            )
            .addSubcommand(sub => 
                sub.setName("pat").setDescription("Pat a user")
                .addUserOption(option => 
                    option.setName("user")
                    .setDescription("User to pat")
                    .setRequired(true)
                )
            )
            .addSubcommand(sub => 
                sub.setName("cuddle").setDescription("Cuddle a user")
                .addUserOption(option => 
                    option.setName("user")
                    .setDescription("User to cuddle")
                    .setRequired(true)
                )
            )
            .addSubcommand(sub => 
                sub.setName("kiss").setDescription("Kiss a user")
                .addUserOption(option => 
                    option.setName("user")
                    .setDescription("User to kiss")
                    .setRequired(true)
                )
            )
            .addSubcommand(sub => 
                sub.setName("smug").setDescription("Smug at a user")
                .addUserOption(option => 
                    option.setName("user").setDescription("User to smug at")
                    .setRequired(true)
                )
            )
        )
        .addSubcommand(sub => 
            sub.setName("8ball").setDescription("Let the magic 8 ball answer your question.")
            .addStringOption(option => 
                option.setName("question").setDescription("Your question").setRequired(true)
            )
        )
        .addSubcommand(sub => sub.setName("coffee").setDescription("It's coffee time"))
        .addSubcommand(sub => sub.setName("fact").setDescription("Get a random fact"))
        .addSubcommand(sub => sub.setName("image").setDescription("Get an image from WaifuPics API"))
        .addSubcommand(sub => sub.setName("joke").setDescription("Get a random joke"))
        .addSubcommand(sub => sub.setName("topic").setDescription("Get a random topic starter"))
        .addSubcommand(sub => sub.setName("wyr").setDescription("Get a would you rather question")),
        

    async execute(interaction: ChatInputCommandInteraction) {
        const sub = interaction.options.getSubcommand();
        const group = interaction.options.getSubcommandGroup();

        if(sub === "8ball") {
            const question = interaction.options.getString("question", true);

            const res = await fetchURL("https://nekos.life/api/v2/8ball");
            if(!res.ok) {
                return interaction.reply({
                    content: res.error!,
                    flags: MessageFlags.Ephemeral
                });
            };

            const data = res.data! as {response: string, url: string};

            const embed = new EmbedBuilder()
                .setTitle("🎱 The magic 8 ball")
                .setDescription(`**Your question:**\n${question}`)
                .setColor(0xfedfe1)
                .setImage(data.url)
                .setFooter({text: "Powered by nekos.life"})
                .setTimestamp();

            return interaction.reply({embeds: [embed]});
        };

        if(sub === "coffee") {
            const res = await fetchURL("https://coffee.alexflipnote.dev/random.json");

            if(!res.ok) {
                return interaction.reply({
                    content: res.error!,
                    flags: MessageFlags.Ephemeral
                });
            };

            const data = res.data! as {file: string};

            const embed = new EmbedBuilder()
                .setTitle("☕ It's coffee time!!!")
                .setColor(0xfedfe1)
                .setImage(data.file)
                .setTimestamp()
                .setFooter({text: "Powered by AlexFlipNote API"});

            return interaction.reply({embeds: [embed]});
        };

        if(sub === "fact") {
            const res = await fetchURL("https://api.popcat.xyz/v2/fact");

            if(!res.ok) {
                return interaction.reply({
                    content: res.error!,
                    flags: MessageFlags.Ephemeral
                });
            };

            const data = res.data! as {error: boolean, message: {fact?: string, error?: string}};

            if(data.error) {
                return interaction.reply({
                    content: `❌ ${data.message.error!}`,
                    flags: MessageFlags.Ephemeral
                });
            };

            const embed = new EmbedBuilder()
                .setTitle("🤓 Fact")
                .setDescription(data.message.fact!)
                .setColor(0xfedfe1)
                .setFooter({text: "Powered by PopCat API"})
                .setTimestamp();

            return interaction.reply({embeds: [embed]});
        };


        if(sub === "image") {
            const categories = {
                Characters: [
                    "waifu", "neko", "shinobu", "megumin"
                ],
                Actions: ["hug", "kiss", "pat", "slap", "kick", "lick", "bite", "glomp", "bonk", "yeet", "cuddle", "poke", "dance", "highfive", "handhold", "kill", "nom", "awoo", "smug", "wave"],
                Reactions: ["cry", "blush", "smile", "wink", "happy", "cringe"]
            };

            const categoryRow = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("image_category")
                    .setPlaceholder("Select a category...")
                    .addOptions(
                        Object.keys(categories).map(cat => ({
                            label: cat,
                            value: cat
                        }))
                    )
            );

            const embed = new EmbedBuilder()
                .setTitle("📸 Image menu")
                .setDescription("Choose a category below to get started!")
                .setColor(0xfedfe1);

            const reply = await interaction.reply({
                embeds: [embed],
                components: [categoryRow.toJSON()]
            });

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60_000
            });

            collector.on("collect", async (i) => {
                if(i.user.id !== interaction.user.id) {
                    return i.reply({
                        content: "❌ This menu is not for you.",
                        flags: MessageFlags.Ephemeral
                    });
                };


                if(i.customId === "image_category") {
                    const chosenCategory = i.values[0] as keyof typeof categories;
                    const endpoints = categories[chosenCategory];


                    const endpointRow = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId("image_endpoint")
                            .setPlaceholder(`Select an endpoint from ${chosenCategory}...`)
                            .addOptions(
                                endpoints.map(ep => ({
                                    label: ep.charAt(0).toUpperCase() + ep.slice(1),
                                    value: ep
                                }))
                            )
                    ).toJSON();

                    const embed2 = new EmbedBuilder()
                        .setTitle(`📂 ${chosenCategory}`)
                        .setDescription("Now choose an endpoint!")
                        .setColor(0xfedfe1);

                    return i.update({
                        embeds: [embed2], components: [endpointRow]
                    });
                };

                if(i.customId === "image_endpoint") {
                    const choice = i.values[0];

                    const res = await fetchURL(`https://api.waifu.pics/sfw/${choice}`);

                    if(!res.ok) {
                        return i.update({
                            content: res.error,
                            embeds: [],
                            components: []
                        });
                    };

                    const data = res.data as {url?: string};

                    if(!data.url) {
                        return i.update({
                            content: "❌ Failed to fetch image.",
                            embeds: [],
                            components: []
                        });
                    };

                    const imgEmbed = new EmbedBuilder()
                        .setTitle(`📸 ${choice.charAt(0).toUpperCase() + choice.slice(1)}`)
                        .setImage(data.url)
                        .setColor(0xfedfe1)
                        .setFooter({text: "Powered by WaifuPics API"});

                    return i.update({
                        embeds: [imgEmbed],
                        components: []
                    });
                }
            });

            collector.on("end", async () => {
                try {
                    await reply.edit({components: []});
                } catch {}
            });
        };


        if(group === "interact") {
            const user = interaction.options.getUser("user", true);

            const author = await interaction.guild!.members.fetch(interaction.user.id)!
            const target = await interaction.guild!.members.fetch(user.id)!

            let title: string = ""

            if(sub === "hug") title = `${author.displayName} hugs ${target.displayName}`;
            if(sub === "pat") title = `${author.displayName} pats ${target.displayName}`;
            if(sub === "cuddle") title = `${author.displayName} cuddles ${target.displayName}`;
            if(sub === "kiss") title = `${author.displayName} kisses ${target.displayName}`;
            if(sub === "smug") title = `${author.displayName} smugs at ${target.displayName}`;

            const res = await fetchURL(`https://nekos.life/api/v2/img/${sub}`);

            if(!res.ok) {
                return interaction.reply({
                    content: res.error!,
                    flags: MessageFlags.Ephemeral
                });
            };

            const data = res.data as {url: string};

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setImage(data.url)
                .setColor(0xfedfe1)
                .setFooter({text: "Powered by nekos.life API"})
                .setTimestamp();

            return interaction.reply({
                embeds: [embed]
            });
        };


        if(sub === "joke") {
            const member = await interaction.guild!.members.fetch(interaction.user.id)!;

            const res = await fetchURL("https://api.popcat.xyz/v2/joke");

            if(!res.ok) {
                return interaction.reply({
                    content: res.error!,
                    flags: MessageFlags.Ephemeral
                });
            };

            const data = res.data! as {
                error: boolean,
                message: {
                    joke?: string,
                    error?: string
                }
            };

            const embed = new EmbedBuilder()
                .setTitle("🤣 Joke")
                .setDescription(data.message.joke!)
                .setThumbnail(member.displayAvatarURL({size: 512}))
                .setColor(0xfedfe1)
                .setFooter({text: "Powered by PopCat API"})
                .setTimestamp();

            return interaction.reply({
                embeds: [embed]
            });
        };

        if(sub === "topic") {
            const topicsPath = path.join(__dirname, "../bot_data/topics.json");

            let topics = require(topicsPath);

            const keys = Object.keys(topics);
            const category = keys[Math.floor(Math.random() * keys.length)];

            const topicList: [] = topics[category];
            const randomTopic: string = topicList[Math.floor(Math.random() * topicList.length)];

            const embed = new EmbedBuilder()
                .setTitle("💬 Topic")
                .setDescription(randomTopic)
                .setColor(0xfedfe1)
                .setFooter({text: `Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`})
                .setTimestamp();

            return interaction.reply({embeds: [embed]});
        };

        if(sub === "wyr") {
            const res = await fetchURL("https://api.popcat.xyz/v2/wyr");

            if(!res.ok) {
                return interaction.reply({
                    content: res.error!,
                    flags: MessageFlags.Ephemeral
                });
            };

            const data = res.data! as {
                error: boolean,
                message: {
                    ops1?: string,
                    ops2?: string,
                    error?: string
                }
            };

            const embed = new EmbedBuilder()
                .setTitle("Would you rather:")
                .setDescription(`${data.message.ops1}\n\nor\n\n${data.message.ops2}`)
                .setColor(0xfedfe1)
                .setTimestamp()
                .setFooter({text: "Powered by PopCat API"});

            return interaction.reply({embeds: [embed]});
        }
    }
}