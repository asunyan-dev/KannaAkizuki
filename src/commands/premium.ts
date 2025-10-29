import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, MessageFlags, EmbedBuilder, ColorResolvable, ModalBuilder, ComponentType, TextInputStyle } from "discord.js";
import customRole from "../bot_modules/customRole";
import ids from "../ids.json";


export default {
    data: new SlashCommandBuilder()
        .setName("premium").setDescription("Premium commands.")
        .addSubcommandGroup(group => group.setName("role").setDescription("Set, edit or remove your custom role.")
            .addSubcommand(sub => sub.setName("set").setDescription("Set up your custom role")
                .addStringOption(option => option.setName("name").setDescription("Name of the role").setRequired(true))
                .addStringOption(option => option.setName("color").setDescription("Color for the role, hex code. Must start with #").setRequired(true))
                .addAttachmentOption(option => option.setName("icon").setDescription("Icon for the role.").setRequired(false))
            )
            .addSubcommand(sub => sub.setName("edit").setDescription("Edit your custom role")
                .addStringOption(o => o.setName("name").setDescription("New name for the role.").setRequired(false))
                .addStringOption(o => o.setName("color").setDescription("New color for the role, hex code, must start with #").setRequired(false))
                .addAttachmentOption(o => o.setName("icon").setDescription("New icon for the role").setRequired(false))
            )
            .addSubcommand(sub => sub.setName("remove").setDescription("Delete your custom role"))
        )
        .addSubcommand(sub => sub.setName("introduction").setDescription("Make your introduction"))
        .addSubcommand(sub => sub.setName("say").setDescription("Make the bot say something").addStringOption(option => option.setName("message").setDescription("The message").setRequired(true))),

    async execute(interaction: ChatInputCommandInteraction) {
        if(!interaction.guild) return;
        const group = interaction.options.getSubcommandGroup();
        const sub = interaction.options.getSubcommand();

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);

        if(!member) return;

        if(!member.premiumSince) {
            return interaction.reply({content: "❌ This command is for boosters. If you want to use it, please consider boosting the server!", flags: MessageFlags.Ephemeral})
        }

        if(group === "role") {
            const formats = ["image/jpg", "image/jpeg", "image/png", "image/gif"];

            const colors = ["#ffb7c5", "#fedfe1", "#e07517", "#4cadd0", "#ff5dd6", "#00f825", "#9b8666", "#ff011b", "#006cb6", "#e3f4ff"];

            let color = interaction.options.getString("color", false);
            let name = interaction.options.getString("name", false);
            const icon = interaction.options.getAttachment("icon", false);

            if(color && !color.startsWith("#")) return interaction.reply({content: "❌ Invalid color. It must start with `#`. Example: #e410d3", flags: MessageFlags.Ephemeral});

            if(color && colors.includes(color)) return interaction.reply({content: "❌ You can't use this color, it for staff only.", flags: MessageFlags.Ephemeral});

            if(icon && !formats.includes(icon.contentType!)) return interaction.reply({content: "❌ Invalid icon format. Allowed: jpg, jpeg, png, gif"});

            const status: string | null = customRole.getRole(interaction.user.id);

            if(sub === "set") {
                const reference = await interaction.guild.roles.fetch(ids.roles.customRoles).catch(() => null);
                if(!reference) {
                    console.error("[ERROR] - Custom role reference role not found.");
                    return interaction.reply({content: "❌ There was an error. Please try again later.", flags: MessageFlags.Ephemeral});
                };

                const role = await interaction.guild.roles.create({
                    name: name!,
                    colors: {
                        primaryColor: color! as ColorResolvable
                    },
                    position: reference.position - 1,
                    icon: icon?.url ?? null
                });

                await customRole.setRole(member.id, role.id);
                await member.roles.add(role);

                return interaction.reply({content: "✅ Role created."});
            };

            if(sub === "edit") {
                if(!status) {
                    return interaction.reply({content: "❌ You don't have a custom role yet. Use `/premium role set` to get started.", flags: MessageFlags.Ephemeral});
                };

                const role = await interaction.guild.roles.fetch(status).catch(() => null);

                if(!role) {
                    await customRole.removeRole(member.id);
                    return interaction.reply({content: "❌ Your role was deleted. Please use `/premium role set` and remake a new one.", flags: MessageFlags.Ephemeral});
                };

                const newRole = await role.edit({
                    name: name || role.name,
                    colors: {
                        primaryColor: color as ColorResolvable || role.hexColor
                    },
                    icon: icon?.url ?? role.iconURL()
                });

                return interaction.reply({content: "✅ Role edited."});
            };

            if(sub === "remove") {
                if(!status) return interaction.reply({content: "❌ You didn't have a custom role!", flags: MessageFlags.Ephemeral});

                const role = await interaction.guild.roles.fetch(status).catch(() => null);

                if(!role) {
                    await customRole.removeRole(member.id);
                    return interaction.reply({content: "✅ Role removed."})
                };

                await role.delete();
                await customRole.removeRole(member.id);
                return interaction.reply({content: "✅ Role removed."});
            }
        };

        if(sub === "introduction") {

            const modal = new ModalBuilder()
                .setCustomId("introduction")
                .setTitle("Introduction")
                .addLabelComponents(
                    {
                        type: ComponentType.Label,
                        label: "About you!",
                        description: "Tell us a bit about yourself",
                        component: {
                            type: ComponentType.TextInput,
                            custom_id: "bio",
                            style: TextInputStyle.Paragraph,
                            placeholder: "Type a short intro here...",
                            required: true
                        }
                    },
                    {
                        type: ComponentType.Label,
                        label: "Birthday",
                        component: {
                            type: ComponentType.TextInput,
                            custom_id: "birthday",
                            style: TextInputStyle.Short,
                            placeholder: "Type your birthday here...",
                            required: false
                        }
                    },
                    {
                        type: ComponentType.Label,
                        label: "Country",
                        component: {
                            type: ComponentType.TextInput,
                            custom_id: "country",
                            placeholder: "Where are you from?",
                            style: TextInputStyle.Short,
                            required: false
                        }
                    },
                    {
                        type: ComponentType.Label,
                        label: "Favorite Game",
                        component: {
                            type: ComponentType.TextInput,
                            style: TextInputStyle.Short,
                            custom_id: "game",
                            placeholder: "What's your favorite game?",
                            required: false
                        }
                    },
                    {
                        type: ComponentType.Label,
                        label: "Favorite Anime",
                        component: {
                            type: ComponentType.TextInput,
                            style: TextInputStyle.Short,
                            custom_id: "anime",
                            placeholder: "What's your favorite anime?",
                            required: false
                        }
                    }
                );

            await interaction.showModal(modal);
        };

        if(sub === "say") {
            const message = interaction.options.getString("message", true);

            if(!interaction.channel) return;
            if(interaction.channel.isDMBased() || !interaction.channel.isSendable()) return;

            await interaction.channel.send(message);
            return interaction.reply({content: "Message sent.", flags: MessageFlags.Ephemeral});
        }
    }
}