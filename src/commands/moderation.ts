import { ChatInputCommandInteraction, SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags, EmbedBuilder, } from "discord.js";
import ms from "ms";
import sendMessage from "../bot_modules/sendMessage";
import ids from "../ids.json"

export default {
    data: new SlashCommandBuilder()
        .setName("moderation").setDescription("Moderation commands")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(sub => sub.setName("ban").setDescription("Ban a user")
            .addUserOption(option => option.setName("user").setDescription("User to ban").setRequired(true))
            .addStringOption(option => option.setName("reason").setDescription("Reason for the ban").setRequired(false))
        )
        .addSubcommand(sub => sub.setName("kick").setDescription("Kick a user")
            .addUserOption(option => option.setName("user").setDescription("The user to kick").setRequired(true))
            .addStringOption(option => option.setName("reason").setDescription("Reason for the kick").setRequired(false))
        )
        .addSubcommand(sub => sub.setName("mute").setDescription("Mute a user")
            .addUserOption(option => option.setName("user").setDescription("The user to mute").setRequired(true))
            .addStringOption(option => option.setName("duration").setDescription("Duration of the mute, example '1 day'").setRequired(true))
            .addStringOption(option => option.setName("reason").setDescription("Reason for the mute").setRequired(false))
        )
        .addSubcommand(sub => sub.setName("unban").setDescription("Unban a user.")
            .addStringOption(option => option.setName("id").setDescription("ID of the user").setRequired(true))
            .addStringOption(option => option.setName("reason").setDescription("Reason of the unban").setRequired(false))
        )
        .addSubcommand(sub => sub.setName("unmute").setDescription("Unmute a user")
            .addUserOption(option => option.setName("user").setDescription("User to unmute").setRequired(true))
            .addStringOption(option => option.setName("reason").setDescription("Reason of the unmute").setRequired(false))
        )
        .addSubcommand(sub => sub.setName("warn").setDescription("Warn a user")
            .addUserOption(option => option.setName("user").setDescription("User to warn.").setRequired(true))
            .addStringOption(option => option.setName("reason").setDescription("Reason of the warning").setRequired(false))
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        if(!interaction.guild) return;
        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if(!member) return;

        const sub = interaction.options.getSubcommand();
        const user = interaction.options.getUser("user", true);
        let reason = interaction.options.getString("reason", false);
        if(!reason) reason = "No reason provided";

        const target = await interaction.guild.members.fetch(user.id).catch(() => null);
        if(!target) return interaction.reply({content: "❌ Member not found.", flags: MessageFlags.Ephemeral});

        const id = interaction.options.getString("id", true);
        const duration = interaction.options.getString("duration", true);
        const me = interaction.guild.members.me;
        if(!me) return;

        if(sub === "ban") {
            if(!member.permissions.has(PermissionFlagsBits.BanMembers)) return interaction.reply({content: "❌ You can't ban members.", flags: MessageFlags.Ephemeral});

            if(member.roles.highest.position <= target.roles.highest.position) {
                return interaction.reply({content: "❌ You can't ban someone with a higher role than you.", flags: MessageFlags.Ephemeral});
            };

            if(target.roles.highest.position >= me.roles.highest.position) {
                return interaction.reply({content: "❌ I can't ban someone with a higher role than me.", flags: MessageFlags.Ephemeral});
            };

            if(!target.bannable) {
                return interaction.reply({content: "❌ This member can't be banned.", flags: MessageFlags.Ephemeral});
            }


            await target.ban({reason: reason});

            const logEmbed = new EmbedBuilder()
                .setTitle("🔨 Member Banned")
                .setDescription(`<@${target.id}>\n\n**Banned by:**\n<@${member.id}> | ID: ${member.id}\n\n**Reason:**\n${reason}`)
                .setColor(0xfedfe1)
                .setFooter({text: `User ID: ${target.id}`})
                .setThumbnail(target.user.avatarURL({size: 512}))
                .setTimestamp();

            await sendMessage(interaction.client, ids.channels.automod, {embeds: [logEmbed]});

            

            try {
                const embed = new EmbedBuilder()
                    .setTitle(`You were banned in Kanna's Sanctuary!`)
                    .setDescription(`**With reason:**\n${reason}`)
                    .setColor(0xfedfe1)
                    .setTimestamp();

                await target.send({embeds: [embed]});
                return interaction.reply({content: "✅ Member banned.", flags: MessageFlags.Ephemeral});
            } catch (err) {
                console.error(err);
                return interaction.reply({content: "✅ Member banned. ❗ Failed to DM member. They have DMs closed.", flags: MessageFlags.Ephemeral});
            }
        } // end of sub ban


        if(sub === "kick") {
            if(!member.permissions.has(PermissionFlagsBits.KickMembers)) {
                return interaction.reply({content: "❌ You can't kick members.", flags: MessageFlags.Ephemeral});
            };

            if(member.roles.highest.position <= target.roles.highest.position) {
                return interaction.reply({content: "❌ You can't kick someone with a higher role than you.", flags: MessageFlags.Ephemeral});
            };

            if(target.roles.highest.position >= me.roles.highest.position) {
                return interaction.reply({content: "❌ I can't kick someone that has a higher role than me.", flags: MessageFlags.Ephemeral});
            };

            if(!target.kickable) {
                return interaction.reply({content: "❌ This member can't be kicked.", flags: MessageFlags.Ephemeral});
            };

            await target.kick(reason);

            const logEmbed = new EmbedBuilder()
                .setTitle("🚪 Member Kicked")
                .setDescription(`<@${target.id}>\n\n**Kicked by:**\n<@${member.id}> | ID: ${member.id}\n\n**Reason:**\n${reason}`)
                .setThumbnail(target.user.avatarURL({size: 512}))
                .setColor(0xfedfe1)
                .setFooter({text: `User ID: ${target.id}`})
                .setTimestamp();

            await sendMessage(interaction.client, ids.channels.automod, {embeds: [logEmbed]});

            try {
                const embed = new EmbedBuilder()
                    .setTitle("You were kicked from Kanna's Sanctuary!")
                    .setDescription(`**With reason:**\n${reason}`)
                    .setColor(0xfedfe1)
                    .setTimestamp();

                await target.send({embeds: [embed]});

                return interaction.reply({content: "✅ Member kicked.", flags: MessageFlags.Ephemeral});
            } catch (err) {
                console.error(err);
                return interaction.reply({content: "✅ Member Kicked. ❗ Failed to DM member, they have DMs closed.", flags: MessageFlags.Ephemeral});
            };
        }; // end of sub kick


        if(sub === "mute") {
            if(!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return interaction.reply({content: "❌ You can't mute members.", flags: MessageFlags.Ephemeral});
            };

            /*@ts-ignore*/
            const msDuration = ms(duration);

            if(target.roles.highest.position >= member.roles.highest.position) {
                return interaction.reply({content: "❌ You can't mute someone with a higher role than you.", flags: MessageFlags.Ephemeral});
            };

            if(target.roles.highest.position >= me.roles.highest.position) {
                return interaction.reply({content: "❌ I can't mute someone with a higher role than me.", flags: MessageFlags.Ephemeral});
            };

            if(!target.moderatable) {
                return interaction.reply({content: "❌ This member is not mutable.", flags: MessageFlags.Ephemeral});
            };

            if(!msDuration) return interaction.reply({content: "❌ Invalid duration. Example: 1 day, 3 hours, 25 minutes.", flags: MessageFlags.Ephemeral});

            await target.timeout(msDuration, reason);

            const until = Math.floor((Date.now() + Number(msDuration) / 1000));

            const logEmbed = new EmbedBuilder()
                .setTitle("🔇 Member Muted")
                .setDescription(`<@${target.id}>\n\n**Muted by:**\n<@${member.id}> | ID: ${member.id}\n\n**Until:**\n<t:${until}:f>\n\n**Reason:**\n${reason}`)
                .setColor(0xfedfe1)
                .setFooter({text: `User ID: ${target.id}`})
                .setThumbnail(target.displayAvatarURL({size: 512}))
                .setTimestamp();

            await sendMessage(interaction.client, ids.channels.automod, {embeds: [logEmbed]});

            try {
                const embed = new EmbedBuilder()
                    .setTitle("You were muted in Kanna's Sanctuary!")
                    .setDescription(`**Until:**\n<t:${until}:f>\n\n**With reason:**\n${reason}`)
                    .setColor(0xfedfe1)
                    .setTimestamp();

                await target.send({embeds: [embed]});
                return interaction.reply({content: "✅ Member muted.", flags: MessageFlags.Ephemeral});
            } catch (err) {
                console.error(err);
                return interaction.reply({content: "✅ Member muted. ❗ Failed to DM member, they have DMs closed.", flags: MessageFlags.Ephemeral});
            };
        }; //end of sub mute

        if(sub === "unban") {
            if(!member.permissions.has(PermissionFlagsBits.BanMembers)) {
                return interaction.reply({content: "❌ You can't unban members."});
            };

            const banned = await interaction.guild.bans.fetch(id).catch(() => null);
            if(!banned) return interaction.reply({content: "❌ Couldn't find user. Are they banned?", flags: MessageFlags.Ephemeral});

            await interaction.guild.bans.remove(id);

            const logEmbed = new EmbedBuilder()
                .setTitle("ℹ Member Unbanned")
                .setDescription(`<@${id}>\n\n**Unbanned by:**\n<@${member.id}> | ID: ${member.id}\n\n**Reason:**\n${reason}`)
                .setColor(0xfedfe1)
                .setFooter({text: `User ID: ${id}`})
                .setTimestamp();

            await sendMessage(interaction.client, ids.channels.automod, {embeds: [logEmbed]});

            return interaction.reply({content: "✅ Member unbanned.", flags: MessageFlags.Ephemeral});
        }; // end of sub unban


        if(sub === "unmute") {
            if(!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return interaction.reply({content: "❌ You can't unmute members.", flags: MessageFlags.Ephemeral});
            };

            if(!target.isCommunicationDisabled()) {
                return interaction.reply({content: "❌ This member is not muted!", flags: MessageFlags.Ephemeral});
            };

            if(member.roles.highest.position <= target.roles.highest.position) {
                return interaction.reply({content: "❌ You can't unmute someone with a higher role than you.", flags: MessageFlags.Ephemeral});
            };

            if(target.roles.highest.position >= me.roles.highest.position) {
                return interaction.reply({content: "❌ I can't unmute someone with a higher role than me.", flags: MessageFlags.Ephemeral});
            };

            if(!target.moderatable) {
                return interaction.reply({content: "❌ This member can't be unmuted.", flags: MessageFlags.Ephemeral});
            };

            await target.timeout(null, reason);

            const logEmbed = new EmbedBuilder()
                .setTitle("🗣 Member Unmuted")
                .setDescription(`<@${target.id}>\n\n**Unmuted by:**\n<@${member.id}> | ID: ${member.id}\n\n**Reason:**\n${reason}`)
                .setColor(0xfedfe1)
                .setFooter({text: `User ID: ${target.id}`})
                .setThumbnail(target.displayAvatarURL({size: 512}))
                .setTimestamp();

            await sendMessage(interaction.client, ids.channels.automod, {embeds: [logEmbed]});

            try {
                const embed = new EmbedBuilder()
                    .setTitle("You were unmuted in Kanna's Sanctuary!")
                    .setDescription(`Reason:\n${reason}`)
                    .setColor(0xfedfe1)
                    .setTimestamp();

                await target.send({embeds: [embed]});
                return interaction.reply({content: "✅ Member unmuted.", flags: MessageFlags.Ephemeral});
            } catch (err) {
                console.error(err);
                return interaction.reply({content: "✅ Member unmuted. ❗ Failed to DM member, they have DMs closed.", flags: MessageFlags.Ephemeral});
            };
        }; // end of sub unmute;


        if(sub === "warn") {
            if(!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return interaction.reply({content: "❌ You can't warn members.", flags: MessageFlags.Ephemeral});
            };

            if(target.roles.highest.position >= member.roles.highest.position) {
                return interaction.reply({content: "❌ You can't warn someone with a higher role than you.", flags: MessageFlags.Ephemeral});
            };

            if(target.roles.highest.position >= me.roles.highest.position) {
                return interaction.reply({content: "❌ I can't warn someone with a higher role than me.", flags: MessageFlags.Ephemeral});
            };

            if(!target.moderatable) {
                return interaction.reply({content: "❌ This member can't be warned.", flags: MessageFlags.Ephemeral});
            };

            try {
                const embed = new EmbedBuilder()
                    .setTitle("You were warned in Kanna's Sanctuary!")
                    .setDescription(`**With reason:**\n${reason}`)
                    .setColor(0xfedfe1)
                    .setTimestamp();

                const logEmbed = new EmbedBuilder()
                    .setTitle("❗ Member warned")
                    .setDescription(`<@${target.id}>\n\n**Warned by:**\n<@${member.id}> | ID: ${member.id}\n\n**Reason:**\n${reason}`)
                    .setColor(0xfedfe1)
                    .setThumbnail(target.displayAvatarURL({size: 512}))
                    .setFooter({text: `User ID: ${target.id}`})
                    .setTimestamp();

                await target.send({embeds: [embed]});
                await sendMessage(interaction.client, ids.channels.automod, {embeds: [logEmbed]});
                return interaction.reply({content: "✅ Member warned.", flags: MessageFlags.Ephemeral});
            } catch (err) {
                console.error(err);
                return interaction.reply({content: "❌ Failed to warn member, they have DMs closed. You should consider using another bot or warn them verbally.", flags: MessageFlags.Ephemeral});
            };
        } // end of sub warn;
    }
}