import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, EmbedBuilder, MessageFlags, ModalBuilder, ComponentType, TextInputStyle, Embed, ColorResolvable } from "discord.js";
import fetchURL from "../bot_modules/fetch";
import afk from "../bot_modules/afk";

export default {
    data: new SlashCommandBuilder()
        .setName("utility").setDescription("Utility Commands")
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(sub => sub.setName("afk").setDescription("Set your afk status").addStringOption(o => o.setName("message").setDescription("Message for your AFK status").setRequired(false)))
        .addSubcommand(sub => sub.setName("color").setDescription("Get info on a hex color").addStringOption(option => option.setName("color").setDescription("Hex color, e.g. #e410d3").setRequired(true)))
        .addSubcommandGroup(group => group.setName("Avatar").addSubcommand(sub => sub.setName("main").setDescription("Get the main pfp").addUserOption(option => option.setName("user").setDescription("User to see pfp for").setRequired(true))).addSubcommand(sub => sub.setName("server").setDescription("Get the server pfp").addUserOption(option => option.setName("user").setDescription("user to see pfp for").setRequired(true))))
        .addSubcommand(sub => sub.setName("ping").setDescription("See the bot's latency"))
        .addSubcommand(sub => sub.setName("report").setDescription("Report a user to admins"))
        .addSubcommand(sub => sub.setName("suggest").setDescription("Make a new suggestion"))
        .addSubcommand(sub => sub.setName("weather").setDescription("Get the current weather for a city").addStringOption(option => option.setName("location").setDescription("Location, format: 'City, Country/State'").setRequired(true))),

    async execute(interaction: ChatInputCommandInteraction) {
        if(!interaction.guild) return;

        const sub = interaction.options.getSubcommand();
        const group = interaction.options.getSubcommandGroup();

        if(sub === "afk") {
            let message = interaction.options.getString("message", false)
            if(!message) message = "AFK";

            await afk.setAfk(interaction.user.id, message);

            const embed = new EmbedBuilder()
                .setTitle("💤 AFK set!")
                .setDescription(`**Message:**\n${message}`)
                .setColor(0xfedfe1);

            return interaction.reply({embeds: [embed]});
        };

        if(sub === "ping") {
            const sent = await interaction.reply({content: "🏓 Pinging...", fetchReply: true});
            const latency = sent.createdTimestamp - interaction.createdTimestamp;

            await interaction.editReply({content: `🏓 Pong! Latency is **${latency} ms.** API latency is **${interaction.client.ws.ping}ms**.`});
            
        };

        if(group === "avatar") {
            const user = interaction.options.getUser("user", true);

            if(sub === "main") {
                const embed = new EmbedBuilder()
                    .setTitle(`${user.displayName}'s main avatar:`)
                    .setColor(0xfedfe1)
                    .setImage(user.avatarURL({size: 1024}))
                    .setTimestamp();

                return interaction.reply({embeds: [embed]});
            };

            if(sub === "server") {
                const member = await interaction.guild.members.fetch(user.id).catch(() => null);
                if(!member) return interaction.reply({content: "❌ Couldn't find member in the server.", flags: MessageFlags.Ephemeral});

                const embed = new EmbedBuilder()
                    .setTitle(`${member.displayName}'s server avatar:`)
                    .setColor(0xfedfe1)
                    .setImage(member.displayAvatarURL({size: 1024}))
                    .setTimestamp();

                return interaction.reply({embeds: [embed]});
            };
        } // end of group avatar;


        if(sub === "color") {
            const color = interaction.options.getString("color", true);

            const res = await fetchURL(`https://api.popcat.xyz/v2/color/${encodeURIComponent(color)}`);

            if(!res.ok) return interaction.reply({content: res.error!, flags: MessageFlags.Ephemeral});

            const data: any = res.data!;

            if(data.error) return interaction.reply({content: `❌ ${data.message.error}`, flags: MessageFlags.Ephemeral});

            const embed = new EmbedBuilder()
                .setTitle(color)
                .setThumbnail(data.message.color_image)
                .addFields(
                    {name: "RGB", value: data.message.rgb, inline: false},
                    {name: "HSL", value: data.message.hsl_string, inline: false},
                    {name: "Brightened", value: data.message.brightened, inline: false}
                )
                .setColor(color as ColorResolvable)
                .setTimestamp();

            return interaction.reply({embeds: [embed]});
        }; //end of sub color;

        if(sub === "report") {
            const modal = new ModalBuilder()
                .setCustomId("report")
                .setTitle("New report")
                .addLabelComponents(
                    {
                        type: ComponentType.Label,
                        label: "Who are you reporting?",
                        component: {
                            type: ComponentType.UserSelect,
                            custom_id: "user",
                            placeholder: "Select a user...",
                            required: true
                        }
                    },
                    {
                        type: ComponentType.Label,
                        label: "Why did you report?",
                        component: {
                            type: ComponentType.TextInput,
                            custom_id: "reason",
                            style: TextInputStyle.Paragraph,
                            placeholder: "Tell us a bit more here...",
                            required: true
                        }
                    }
                ).toJSON();

            await interaction.showModal(modal);
        } // end of sub report;

        if(sub === "suggest") {
            const modal = new ModalBuilder()
                .setCustomId("suggestion")
                .setTitle("New suggestion")
                .addLabelComponents(
                    {
                        type: ComponentType.Label,
                        label: "Your suggestion",
                        description: "Explain us your suggestion in the text input field!",
                        component: {
                            type: ComponentType.TextInput,
                            custom_id: "suggestion",
                            style: TextInputStyle.Paragraph,
                            required: true,
                            placeholder: "Give us as much detail as possible..."
                        }
                    }
                ).toJSON();

            await interaction.showModal(modal);
        } // end of sub suggestion;

        if(sub === "weather") {
            const query = interaction.options.getString("location", true);

            const res = await fetchURL(`https://api.popcat.xyz/v2/weather?q=${encodeURIComponent(query)}`);

            if(!res.ok) return interaction.reply({content: res.error!, flags: MessageFlags.Ephemeral});

            const data: any = res.data;

            if(!data.message) return interaction.reply({content: `❌ No weather found for this location.`, flags: MessageFlags.Ephemeral});

            const weather = data.message[0];
            const location = weather.location.name;
            const current = weather.current;

            const embed = new EmbedBuilder()
                .setTitle(`Current weather for ${location}`)
                .setDescription(`**Weather observed on ${current.day}, ${current.date} at ${current.observationtime} (local time).**\n\n**Current weather:** ${current.skytext}\n\n**Temperature:** ${current.temperature} °C | **Feels like:** ${current.feelslike} °C\n\n**Humidity:** ${current.humidity}%\n\n**Wind:** ${current.winddisplay}`)
                .setColor(0xfedfe1)
                .setTimestamp()
                .setFooter({text: "Provided by PopCat API."});

            return interaction.reply({embeds: [embed]});


        }
    }
}