import { Message, Client, EmbedBuilder, Events } from "discord.js";
import blocked from "../blocked.json"
import ids from "../ids.json"
import sendMessage from "../bot_modules/sendMessage";

export default {
    name: Events.MessageUpdate,

    async execute(oldMessage: Message, newMessage: Message, client: any) {
        if(newMessage.author.bot) return;
        if(newMessage.channel.isDMBased()) return;

        if(blocked.channels.includes(newMessage.channel.id)) return;

        if(newMessage.channel.parentId && blocked.parents.includes(newMessage.channel.parentId)) return;

        if(oldMessage.content !== newMessage.content) {
            const embed = new EmbedBuilder()
                .setTitle(`🔄 Message edited in ${newMessage.channel.name}`)
                .setDescription(
                    `<@${newMessage.author.id}>\n\n**Before:**\n${oldMessage.content}\n\n**+ After:**\n${newMessage.content}`
                )
                .setColor(0xfedfe1)
                .setFooter({text: `User ID: ${newMessage.author.id}`})
                .setThumbnail(newMessage.member?.displayAvatarURL({size: 512}) ?? newMessage.author.avatarURL({size: 512}))
                .setTimestamp();

            sendMessage(client, ids.channels.messageLogs, {
                embeds: [embed]
            });
        };
    }
}