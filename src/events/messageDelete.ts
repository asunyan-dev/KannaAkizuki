import { Message, Client, EmbedBuilder } from "discord.js"
import blocked from "../blocked.json"
import ids from "../ids.json"
import sendMessage from "../bot_modules/sendMessage"


export default {
    name: "messageDelete",

    async execute(message: Message, client: Client) {
        if(message.partial) {
            try {
                await message.fetch();
            } catch (error) {
                console.error(error);
                return;
            };
        };

        try {

            if(message.channel.isDMBased()) return;

            if(blocked.channels.includes(message.channel.id)) return;
            if(message.channel.parentId && blocked.parents.includes(message.channel.parentId)) return;

            let description = "";

            if(message.content) description += `**Content:**\n${message.content}`;

            if(message.attachments && message.attachments.size > 0) {
                description += `\n\n**Attachments:**\n${message.attachments.map(attachment => attachment.url).join("\n")}`;
            };

            if(message.stickers && message.stickers.size > 0) {
                description += `**Stickers:**\n${message.stickers.map(s => `https://media.discordapp.net/stickers/${s.id}.webp?animated=true`).join("\n")}`;
            };


            const embed = new EmbedBuilder()
                .setTitle(`🚮 Message deleted in #${message.channel.name}`)
                .setColor(0xfedfe1)
                .setDescription(`<@${message.author.id}>\n\n${description}`)
                .setFooter({text: `User ID: ${message.author.id}`})
                .setThumbnail(message.member?.displayAvatarURL({size: 512}) ?? message.author.avatarURL({size: 512}))
                .setTimestamp();

            sendMessage(client, ids.channels.messageLogs, {
                embeds: [embed]
            });
        } catch (error) {
            console.error(error);
        }
    }
}