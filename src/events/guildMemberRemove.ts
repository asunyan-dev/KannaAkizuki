import { GuildMember, Client, EmbedBuilder } from "discord.js";
import sendMessage from "../bot_modules/sendMessage";
import ids from "../ids.json";

export default {
    name: "guildMemberRemove",

    async execute(member: GuildMember, client: Client) {
        if(member.partial) {
            try {
                await member.fetch()
            } catch (error) {
                console.error(error);
                return;
            };
        };

        let joined;
        if(member.joinedTimestamp) {
            joined = `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
        } else {
            joined = "No data found."
        };

        const embed = new EmbedBuilder()
            .setTitle("🚪 Member left")
            .setDescription(`<@${member.id}>\n\n**Member since:** ${joined}`)
            .setColor(0xfedfe1)
            .setThumbnail(member.displayAvatarURL({size: 512}))
            .setFooter({text: `User ID: ${member.id}`})
            .setTimestamp();

        sendMessage(client, ids.channels.joinLeaveLogs, {
            embeds: [embed]
        });
    }
}