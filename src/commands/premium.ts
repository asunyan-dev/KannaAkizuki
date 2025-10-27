import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, MessageFlags, EmbedBuilder, ColorResolvable } from "discord.js";
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
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        if(!interaction.guild) return;
        const group = interaction.options.getSubcommandGroup();
        const sub = interaction.options.getSubcommand();

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);

        if(!member) return;

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
        }
    }
}