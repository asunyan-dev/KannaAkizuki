import { User, Client, EmbedBuilder } from "discord.js"
import ids from "../ids.json"
import sendMessage from "../bot_modules/sendMessage";

export default {
    name: "userUpdate",

    async execute(oldUser: User, newUser: User, client: Client) {
        const member = await client.guilds.cache.get(ids.guilds.kannacord)!.members.fetch(newUser.id);
        if(!member) return;
        if(newUser.bot) return;

        if(oldUser.avatar !== newUser.avatar) {
            const embed = new EmbedBuilder()
                .setTitle("📸 Avatar Change")
                .setDescription(`<@${newUser.id}>`)
                .setColor(0xfedfe1)
                .setThumbnail(newUser.avatarURL({size: 512}))
                .setFooter({text: `User ID: ${newUser.id}`})
                .setTimestamp();

            sendMessage(client, ids.channels.memberEventsLogs, {
                embeds: [embed]
            });
        };


        if(oldUser.username !== newUser.username) {
            const embed = new EmbedBuilder()
                .setTitle("🔖 Username change")
                .setDescription(`<@${newUser.id}>\n**Before:** ${oldUser.username}\n\n**+ After:** ${newUser.username}`)
                .setColor(0xfedfe1)
                .setFooter({text: `User ID: ${newUser.id}`})
                .setThumbnail(member.displayAvatarURL({size: 512}))
                .setTimestamp();

            sendMessage(client, ids.channels.memberEventsLogs, {
                embeds: [embed]
            });
        }
    }
}