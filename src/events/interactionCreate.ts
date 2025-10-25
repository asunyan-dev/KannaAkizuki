import { Interaction, Collection, MessageFlags, Client, SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ContainerBuilder, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder, SeparatorBuilder } from "discord.js";
import ids from "../ids.json";
import sendMessage from "../bot_modules/sendMessage"
import botLogs from "../bot_modules/botLogs";

type Command = {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

export default {
    name: "interactionCreate",

    async execute(interaction: Interaction, client: Client) {
        if(interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if(!command) return;

            if(!client.cooldowns.has(command.data.name)) {
                client.cooldowns.set(command.data.name, new Collection());
            };

            const now = Date.now();
            const timestamps = client.cooldowns.get(command.data.name)!;
            const cooldownAmount = (command.cooldown || 3) * 1000

            if(timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;

                if(now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000
                    return interaction.reply({
                        content: `⏳ Please wait ${timeLeft.toFixed(1)} more second(s) before using /${command.data.name} again.`,
                        flags: MessageFlags.Ephemeral
                    });
                };

                timestamps.set(interaction.user.id, now);
                setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

                try {
                    await command.execute(interaction)
                } catch (error) {
                    console.error(error);
                    if(interaction.replied || interaction.deferred) {
                        await interaction.followUp({
                            content: "❌ There was an error executing this command!",
                            flags: MessageFlags.Ephemeral
                        });
                    } else {
                        await interaction.reply({
                            content: "❌ There was an error executing this command!",
                            flags: MessageFlags.Ephemeral
                        })
                    }
                }
            }
        };


        if(interaction.isModalSubmit()) {
            if(interaction.customId === "report") {
                const user = interaction.fields.getSelectedUsers("user", true);
                const reason = interaction.fields.getTextInputValue("reason");
                const author = await interaction.guild!.members.fetch(interaction.user.id);
                const target = user.first()!;
                const member = await interaction.guild!.members.fetch(target.id);
                if(!member) {
                    return interaction.reply({
                        content: "❌ Couldn't find member in the server.",
                        flags: MessageFlags.Ephemeral
                    });
                };

                const container = new ContainerBuilder()
                    .setAccentColor(0xfedfe1)
                    .addSectionComponents(
                        new SectionBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder()
                                    .setContent(
                                        `## ❗ New user report\n\n### From:\n<@${author.id}> | ID: ${author.id}\n\n### User reported:\n<@${member.id}> | ID: ${member.id}`
                                    )
                            )
                            .setThumbnailAccessory(
                                new ThumbnailBuilder()
                                    .setURL(member.displayAvatarURL({size: 512}))
                            )
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`### Report message:\n${reason}`)
                    );

                await sendMessage(
                    interaction.client,
                    ids.channels.adminChat,
                    {
                        allowedMentions: {
                            parse: []
                        },
                        flags: MessageFlags.IsComponentsV2,
                        components: [container]
                    }
                );

                return interaction.reply({
                    content: "✅ Report sent. If the staff needs more info, they will contact you through a ticket.",
                    flags: MessageFlags.Ephemeral
                });
            };


            if(interaction.customId === "suggestion") {
                const member = await interaction.guild!.members.fetch(interaction.user.id);
                const suggestion = interaction.fields.getTextInputValue("suggestion");

                const embed = new EmbedBuilder()
                    .setTitle("❓ New suggestion")
                    .setDescription(suggestion)
                    .setThumbnail(member.displayAvatarURL({size: 512}))
                    .setColor(0xfedfe1)
                    .setTimestamp();

                const message = await sendMessage(interaction.client, ids.channels.suggestions, {embeds: [embed]});
                await message.react("⬆");
                await message.react("⬇");
                return interaction.reply({
                    content: "✅ Suggestion sent!",
                    flags: MessageFlags.Ephemeral
                });
            };

            

            if(interaction.customId === "changelog") {
                const version = interaction.fields.getTextInputValue("version");
                const details = interaction.fields.getTextInputValue("details");

                await botLogs.addLog(version, details);
                return interaction.reply({
                    content: "✅ Changelog added.",
                    flags: MessageFlags.Ephemeral
                })
            };

            if(interaction.customId === "announce") {
                const channel = interaction.fields.getSelectedChannels("channel", true);
                const targetChannel = channel.first();
                const role = interaction.fields.getSelectedRoles("role", true);
                const targetRole = role.first();
                const announce = interaction.fields.getTextInputValue("announce");

                const embed = new EmbedBuilder()
                    .setTitle("Announcement")
                    .setColor(0xfedfe1)
                    .setDescription(announce)
                    .setTimestamp();

                await sendMessage(interaction.client, targetChannel!.id, {
                    content: `<@&${targetRole!.id}>`,
                    embeds: [embed]
                });

                return interaction.reply({
                    content: "✅ Announce sent!",
                    flags: MessageFlags.Ephemeral
                })
            }
        }
    }
}