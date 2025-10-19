import { Client, MessageCreateOptions, Message } from "discord.js";

export default async function sendMessage(
    client: Client,
    channelId: string,
    data: string | MessageCreateOptions
): Promise<Message> {

    const channel = await client.channels.fetch(channelId);

    if(!channel) {
        throw new Error(`Channel with ID ${channelId} not found.`);
    };

    if(!channel.isSendable()) {
        throw new Error(`Can't send message in channel with ID ${channelId}`);
    };

    return await channel.send(data);

}