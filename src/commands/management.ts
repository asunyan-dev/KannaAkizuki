import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags, ModalBuilder, ComponentType, TextInputStyle, Component, ChannelType } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("management").setDescription("Management commands")
        .addSubcommand(sub => sub.setName("announce").setDescription("Make a new announcement")),

    async execute(interaction: ChatInputCommandInteraction) {
        if(!interaction.guild) return;
        const sub = interaction.options.getSubcommand();
        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if(!member) return;

        if(sub === "announce") {
            if(!member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({content: "❌ You need admin perms for this command.", flags: MessageFlags.Ephemeral});
            };

            const modal = new ModalBuilder()
                .setCustomId("announce")
                .setTitle("New announcement")
                .addLabelComponents(
                    {
                        type: ComponentType.Label,
                        label: "Channel for the announcement",
                        description: "Select the channel below",
                        component: {
                            type: ComponentType.ChannelSelect,
                            custom_id: "channel",
                            placeholder: "Select a channel...",
                            required: true
                        }
                    },
                    {
                        type: ComponentType.Label,
                        label: "Which role do we ping?",
                        description: "Select a role below to ping.",
                        component: {
                            type: ComponentType.RoleSelect,
                            custom_id: "role",
                            placeholder: "Select a role...",
                            required: true
                        }
                    },
                    {
                        type: ComponentType.Label,
                        label: "Your announce",
                        description: "Type your announcement below. (Max. 4,000 characters)",
                        component: {
                            type: ComponentType.TextInput,
                            custom_id: "announce",
                            style: TextInputStyle.Paragraph,
                            placeholder: "Type your announce here... (supports markdown)",
                            required: true
                        }
                    }
                );

            await interaction.showModal(modal);
        };

        
    }
}