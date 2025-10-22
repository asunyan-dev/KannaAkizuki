import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, MessageFlags, EmbedBuilder, Client } from "discord.js";
import fetchURL from "../bot_modules/fetch";


export default {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Get info.")
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(sub => 
            sub.setName("anime").setDescription("Get info about an anime")
            .addStringOption(option => 
                option.setName("query").setDescription("The anime name").setRequired(true)
            )
        )
        .addSubcommand(sub => 
            sub.setName("character").setDescription("Get info about anime character")
            .addStringOption(option => 
                option.setName("query").setDescription("Character name").setRequired(true)
            )
        )
        .addSubcommand(sub => 
            sub.setName("bot").setDescription("Bot info")
        )
        .addSubcommand(sub => 
            sub.setName("user").setDescription("Get user info")
            .addUserOption(option => 
                option.setName("user").setDescription("User to look for").setRequired(false)
            )
        )
        .addSubcommand(sub => 
            sub.setName("role").setDescription("Get role info")
            .addRoleOption(option => 
                option.setName("role").setDescription("Role to look for").setRequired(true)
            )
        )
        .addSubcommand(sub => 
            sub.setName("server").setDescription("Get server info")
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        if(!interaction.guild) return;

        const sub = interaction.options.getSubcommand();

        if(sub === "anime") {
            const query = interaction.options.getString("query", true);

            
                const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`).catch(() => null);

                if(!res || !res.ok) {
                    return interaction.reply({
                        content: "❌ There was an error with the API, please try again later.",
                        flags: MessageFlags.Ephemeral
                    });
                };

                const data: any = await res.json();

                if(!data) return interaction.reply({
                    content: "❌ There was an error with the API, please try again later.",
                    flags: MessageFlags.Ephemeral
                });

                if(!data.data || data.data.length === 0) {
                    return interaction.reply({
                        content: "❌ No anime found with that name.",
                        flags: MessageFlags.Ephemeral
                    });
                };

                const anime = data.data[0];

                const embed = new EmbedBuilder()
                    .setTitle(anime.title)
                    .setURL(anime.url)
                    .setThumbnail(anime.images.jpg.image_url)
                    .setDescription(anime.synopsis ? anime.synopsis.substring(0, 400) + "..." : "No synopsis available.")
                    .addFields(
                        {
                            name: "⭐ Score",
                            value: anime.score ? anime.score.toString() : "N/A",
                            inline: false
                        },
                        {
                            name: "📅 Year",
                            value: anime.year ? anime.year.toString() : "Unknown",
                            inline: false
                        },
                        {
                            name: "🎫 Episodes",
                            value: anime.episodes ? anime.episodes.toString() : "Unknown",
                            inline: false
                        },
                        {
                            name: "📡 Status",
                            value: anime.status || "Unknown",
                            inline: false
                        }
                    )
                    .setColor(0xfedfe1)
                    .setTimestamp()
                    .setFooter({text: "Data from MyAnimeList (Jikan API)"});

                return interaction.reply({
                    embeds: [embed]
                });
            
        };

        if(sub === "character") {
            const query = interaction.options.getString("query", true);

            const res = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=1&fields=voices,anime,manga`).catch(() => null);

            if(!res || !res.ok) {
                return interaction.reply({
                    content: "❌ There was an error with the API, please try again later.",
                    flags: MessageFlags.Ephemeral
                });
            };

            const data: any = await res.json();

            if(!data.data || data.data.length === 0) {
                return interaction.reply({
                    content: "❌ No character found with that name.",
                    flags: MessageFlags.Ephemeral
                });
            };

            const char = data.data[0];

            let voiceActor: string = "N/A";
            if(char.voices && char.voices.length > 0) {
                const jpVA = char.voices.find((v: { language: string; }) => v.language === "Japanese");
                if(jpVA) {
                    voiceActor = `[${jpVA.person.name}](${jpVA.person.url}) (${jpVA.language})`;
                } else {
                    const va = char.voices[0];
                    voiceActor = `[${va.person.name}](${va.person.url}) (${va.language})`;
                };
            };

            const embed = new EmbedBuilder()
                .setTitle(char.name)
                .setURL(char.url)
                .setThumbnail(char.images.jpg.image_url)
                .setDescription(char.about ? (char.about.length > 400 ? char.about.substring(0, 400) + "..." : char.about) : "No description available")
                .setColor(0xfedfe1)
                .setFooter({text: "Data from MyAnimeList (Jikan API)"})
                .addFields(
                    {
                        name: "🈶 Kanji",
                        value: char.name_kanji || "N/A",
                        inline: false
                    },
                    {
                        name: "🎤 Voice Actor",
                        value: voiceActor,
                        inline: false
                    },
                    {
                        name: "🎂 Birthday",
                        value: char.birthday || "Unknown",
                        inline: false
                    },
                    {
                        name: "📺 Anime Appearances",
                        value: char.anime?.slice(0, 3).map((a: {anime: {title: string}}) => a.anime.title).join(", ") || "N/A",
                        inline: false
                    },
                    {
                        name: "📚 Manga Appearances",
                        value: char.manga?.slice(0, 3).map((m: {manga: {title: string}}) => m.manga.title).join(", ") || "N/A",
                        inline: false
                    }
                );

            return interaction.reply({embeds: [embed]});

        };


        if(sub === "bot") {
            const client = interaction.client;

            const embed = new EmbedBuilder()
                .setTitle(`${client.user.tag} - Information`)
                .setDescription(`This bot was developped by:\n<@956295642697846884>\n\nBot's T.O.S.: [click here](https://docs.google.com/document/d/1348-AtSqiwOu05616MmHJCuJpTv1WaG3RJrzPsJVJMs/edit?usp=sharing)\nBot's Privacy Policy: [click here](https://docs.google.com/document/d/1e9NIf01AM4k-cpHZCm6XsfT5oHfRXj3hw_CYYLHI1zo/edit?usp=sharing)`)
                .addFields(
                    { name: "Commands count", value: client.commands.size.toString(), inline: false },
                    { name: "Cached server count", value: client.guilds.cache.size.toString(), inline: false },
                    { name: "Cached user count", value: client.users.cache.size.toString(), inline: false},
                    { name: "Bot's current ping", value: client.ws.ping.toString + "ms", inline: false },
                    {name: "Bot's uptime", value: `<t:${Math.floor(Date.now() / 1000 - process.uptime())}:R>`, inline: false}
                )
                .setThumbnail(client.user.avatarURL({size: 512}))
                .setFooter({text: `Bot ID: ${client.user.id}`})
                .setTimestamp();

            return interaction.reply({embeds: [embed]});
        };

        if(sub === "user") {
            let user = interaction.options.getUser("user", false);

            if(!user) user = interaction.user;

            let member = await interaction.guild.members.fetch(user.id).catch(() => null);

            await user.fetch();

            const embed = new EmbedBuilder()
                .setTitle(user.username)
                .setThumbnail(member?.displayAvatarURL({size: 512}) ?? user.avatarURL({size: 512}))
                .setDescription(
                    `🆔 User ID: ${user.id}\n\n📅 Account Created: <t:${Math.floor(user.createdTimestamp / 1000)}:D>\n\n📥 Joined server: ${member?.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D` : "N/A"}\n\n🔖 Roles:\n${member && member.roles.cache.size > 1 ? member.roles.cache.filter(r => r.id !== interaction.guild!.id).map(r => r.toString()).join(", ") : "None"}`
                )
                .setImage(user.bannerURL({size: 1024}) || null)
                .setColor(0xfedfe1)
                .setTimestamp();

            return interaction.reply({embeds: [embed]});
        };

        if(sub === "role") {
            const role = interaction.options.getRole("role", true);

            const fetched = await interaction.guild.roles.fetch(role.id).catch(() => null);

            if(!fetched) return interaction.reply({
                content: "❌ Couldn't find role in server.",
                flags: MessageFlags.Ephemeral
            });

            const embed = new EmbedBuilder()
                .setTitle(fetched.name)
                .setColor(fetched.hexColor || 0xfedfe1)
                .setDescription(
                    `🔖 Name: ${fetched.name}\n\n📅 Created: <t:${Math.floor(fetched.createdTimestamp / 1000)}:D>\n\n🆔 Role ID: ${fetched.id}\n\n⭐ Hoisted? ${fetched.hoist ? "✅" : "❌"}`
                )
                .setThumbnail(fetched.iconURL({size: 512}) || null)
                .setTimestamp();

            return interaction.reply({embeds: [embed]});
        };

        if(sub === "server") {
            const guild = await interaction.guild.fetch();

            const embed = new EmbedBuilder()
                .setTitle(guild.name)
                .setThumbnail(guild.iconURL({size: 512}) || null)
                .setColor(0xfedfe1)
                .setDescription(
                    `⭐ Owner: <@${guild.ownerId}>\n\n📅 Server created: <t:${Math.floor(guild.createdTimestamp / 1000)}:D>\n\n🙋‍♀️ Member Count: ${guild.memberCount}\n\n🔖 Roles: ${guild.roles.cache.size.toString()}\n\n#️⃣ Channels: ${guild.channels.cache.size.toString()}\n\n🤣 Emojis: ${guild.emojis.cache.size.toString()}\n\n📸 Stickers: ${guild.stickers.cache.size.toString()}`
                )
                .setImage(guild.bannerURL({size: 1024}) || null)
                .setTimestamp();

            return interaction.reply({embeds: [embed]});
        }
    }
}