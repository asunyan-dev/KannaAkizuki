import { GuildMember, EmbedBuilder, Client } from "discord.js";
import sendMessage from "../bot_modules/sendMessage";
import ids from "../ids.json";
import fs from "fs";
import path from "path";

export default {
    name: "guildMemberAdd",

    async execute(member: GuildMember, client: Client) {

        const user = await member.guild.members.fetch(member.id).catch(() => null);

        if(!user) return;

        const file = path.join(__dirname, "../bot_data/blacklist.json");

        const blacklist = JSON.parse(fs.readFileSync(file, "utf8"));

        if(blacklist[user.id] === true) {
            await member.ban({reason: "blacklist"});
        };

        const generalEmbed = new EmbedBuilder()
            .setTitle(`Welcome to Kanna's Sanctuary, ${member.displayName}!`)
            .setDescription(`We hope you will like it here! Please read the <#${ids.channels.rules}>, Introduce yourself in <#${ids.channels.introductions}> if you want, and come chat with us!\nEnjoy your stay!`)
            .setColor(0xfedfe1)
            .setThumbnail(member.displayAvatarURL({size: 512}))
            .setFooter({text: "This message was sent by server staff."})
            .setTimestamp();

        const logsEmbed = new EmbedBuilder()
            .setTitle("🚪 Member Joined")
            .setDescription(`<@${member.id}>\n\n${member.guild.memberCount}th to join.`)
            .setColor(0xfedfe1)
            .setThumbnail(member.displayAvatarURL({size: 512}))
            .setFooter({text: `User ID: ${member.id}`})
            .setTimestamp();

        sendMessage(client, ids.channels.general, {
            content: `<@${member.id}>`,
            embeds: [generalEmbed]
        });
        sendMessage(client, ids.channels.joinLeaveLogs, {embeds: [logsEmbed]});
    }
}