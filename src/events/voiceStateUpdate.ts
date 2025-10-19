import { VoiceState, Client, EmbedBuilder } from "discord.js";
import ids from "../ids.json";
import sendMessage from "../bot_modules/sendMessage";

export default {
    name: "voiceStateUpdate",

    async execute(oldState: VoiceState, newState: VoiceState, client: Client) {

        const member = newState.member;
        if(!member) return;

        if(!oldState.channel && newState.channel) {
            const embed = new EmbedBuilder()
                .setTitle("Voice joined")
                .setDescription(`<@${member.id}> joined VC #${newState.channel.name}`)
                .setFooter({text: `User ID: ${member.id}`})
                .setThumbnail(member.displayAvatarURL({size: 512}))
                .setTimestamp()
                .setColor(0xfedfe1);

            sendMessage(client, ids.channels.voiceLogs, {
                embeds: [embed]
            });
        };

        if(oldState.channel && !newState.channel) {
            const embed = new EmbedBuilder()
                .setTitle("Voice left")
                .setDescription(`<@${member.id}> left VC #${oldState.channel.name}`)
                .setColor(0xfedfe1)
                .setFooter({text: `User ID: ${member.id}`})
                .setThumbnail(member.displayAvatarURL({size: 512}))
                .setTimestamp();

            sendMessage(client, ids.channels.voiceLogs, {
                embeds: [embed]
            });
        };

        if(oldState.channel !== newState.channel) {
            const embed = new EmbedBuilder()
                .setTitle("Member moved")
                .setDescription(`<@${member.id}> moved from VC #${oldState.channel!.name} to VC #${newState.channel!.name}`)
                .setThumbnail(member.displayAvatarURL({size: 512}))
                .setColor(0xfedfe1)
                .setFooter({text: `User ID: ${member.id}`})
                .setTimestamp();

            sendMessage(client, ids.channels.voiceLogs, {
                embeds: [embed]
            });
        };
    }
}