import { GuildMember, Client, EmbedBuilder, Events } from "discord.js";
import customRole from "../bot_modules/customRole";
import ids from "../ids.json";
import sendMessage from "../bot_modules/sendMessage";

export default {
    name: Events.GuildMemberUpdate,

    async execute(oldMember: GuildMember, newMember: GuildMember, client: any) {
        if(newMember.user.bot) return;

        const oldRoles = new Set(oldMember.roles.cache.keys());
        const newRoles = new Set(newMember.roles.cache.keys());

        const addedRoles = [...newRoles].filter(roleId => !oldRoles.has(roleId));
        const removedRoles = [...oldRoles].filter(roleId => !newRoles.has(roleId));

        if(addedRoles.length) {
            const embed = new EmbedBuilder()
                .setTitle("➕ Roles added")
                .setColor(0xfedfe1)
                .setDescription(
                    `<@${newMember.id}>\n\n- ${addedRoles.map(id => `<@&${id}>`).join("\n-")}`
                )
                .setThumbnail(newMember.displayAvatarURL({size: 512}))
                .setFooter({text: `User ID: ${newMember.id}`})
                .setTimestamp();

            sendMessage(client, ids.channels.memberEventsLogs, {
                embeds: [embed]
            });
        };

        if(removedRoles.length) {
            const embed = new EmbedBuilder()
                .setTitle("➖ Roles removed")
                .setColor(0xfedfe1)
                .setDescription(
                    `<@${newMember.id}>\n\n- ${removedRoles.map(id => `<@&${id}>`).join("\n-")}`
                )
                .setFooter({text: `User ID: ${newMember.id}`})
                .setThumbnail(newMember.displayAvatarURL({size: 512}))
                .setTimestamp();

            sendMessage(client, ids.channels.memberEventsLogs, {
                embeds: [embed]
            });
        };


        if(oldMember.avatar !== newMember.avatar) {
            let embed = new EmbedBuilder()
                .setTitle("📸 Avatar Change")
                .setColor(0xfedfe1)
                .setDescription(`<@${newMember.id}>`)
                .setThumbnail(newMember.displayAvatarURL({size: 512}))
                .setFooter({text: `User ID: ${newMember.id}`})
                .setTimestamp();

            sendMessage(client, ids.channels.memberEventsLogs, {
                embeds: [embed]
            });
        };

        if(oldMember.displayName !== newMember.displayName) {
            const embed = new EmbedBuilder()
                .setTitle("🔖 Name change")
                .setDescription(`<@${newMember.id}>\n\n**Before:**\n${oldMember.displayName}\n\n**+ After:**\n${newMember.displayName}`)
                .setColor(0xfedfe1)
                .setThumbnail(newMember.displayAvatarURL({size: 512}))
                .setTimestamp()
                .setFooter({text: `User ID: ${newMember.id}`});

            sendMessage(client, ids.channels.memberEventsLogs, {
                embeds: [embed]
            });
        };

        if(!oldMember.premiumSince && newMember.premiumSince) {
            const generalEmbed = new EmbedBuilder()
                .setTitle(`💎 Ara? Feel like being "Premium"??`)
                .setDescription(`Thank you so much for boosting, ${newMember.displayName}!\n\n-# You can claim a custom role by using /premium role`)
                .setThumbnail(newMember.displayAvatarURL({size: 512}))
                .setColor(0xfedfe1)
                .setTimestamp();

            const logsEmbed = new EmbedBuilder()
                .setTitle("💎 Member boosted!")
                .setDescription(`<@${newMember.id}> started boosting the server.`)
                .setColor(0xfedfe1)
                .setThumbnail(newMember.displayAvatarURL({size: 512}))
                .setFooter({text: `User ID: ${newMember.id}`})
                .setTimestamp();

            sendMessage(client, ids.channels.memberEventsLogs, {
                embeds: [logsEmbed]
            });

            sendMessage(client, ids.channels.general, {
                content: `<@${newMember.id}>`,
                embeds: [generalEmbed]
            });
        };

        if(oldMember.premiumSince && !newMember.premiumSince) {
            const embed = new EmbedBuilder()
                .setTitle("😢 Member unboosted...")
                .setDescription(`<@${newMember.id}> stopped boosting the server.`)
                .setThumbnail(newMember.displayAvatarURL({size: 512}))
                .setFooter({text: `User ID: ${newMember.id}`})
                .setColor(0xfedfe1)
                .setTimestamp();

            sendMessage(client, ids.channels.memberEventsLogs, {
                embeds: [embed]
            });

            const status = customRole.getRole(newMember.id);
            if(!status) {return} else {
                const role = await newMember.guild.roles.fetch(status);
                if(!role) {
                    return customRole.removeRole(newMember.id);
                } else {
                    await role.delete();
                    customRole.removeRole(newMember.id);
                };
            };
        };

        if(!oldMember.isCommunicationDisabled() && newMember.isCommunicationDisabled()) {
            const disabledUntil = Math.floor(newMember.communicationDisabledUntilTimestamp / 1000);
            const embed = new EmbedBuilder()
                .setTitle("🔇 Member timed out")
                .setDescription(`<@${newMember.id}>\n\n**Muted until:**\n<t:${disabledUntil}:f>`)
                .setThumbnail(newMember.displayAvatarURL({size: 512}))
                .setColor(0xfedfe1)
                .setFooter({text: `User ID: ${newMember.id}`})
                .setTimestamp();

            sendMessage(client, ids.channels.memberEventsLogs, {
                embeds: [embed]
            });
        };

        if(oldMember.isCommunicationDisabled() && !newMember.isCommunicationDisabled()) {
            const embed = new EmbedBuilder()
                .setTitle("🔊 End of timeout")
                .setDescription(`<@${newMember.id}>`)
                .setThumbnail(newMember.displayAvatarURL({size: 512}))
                .setColor(0xfedfe1)
                .setFooter({text: `User ID: ${newMember.id}`})
                .setTimestamp();

            sendMessage(client, ids.channels.memberEventsLogs, {
                embeds: [embed]
            });
        };
    }
}
