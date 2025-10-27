import { Client, ActivityType, Events } from "discord.js";
import ids from "../ids.json";

export default {
    name: Events.ClientReady,
    once: true,

    async execute(client: any) {
        console.log(`✅ Logged in as ${client.user!.tag}`)
        const guild = await client.guilds.fetch(ids.guilds.kannacord);
        await guild.members.fetch();
        client.user!.setPresence({
            activities: [{
                name: `🌸 Member count: ${guild.memberCount}`,
                type: ActivityType.Custom,
                state: `🌸 Member count: ${guild.memberCount}`
            }],
            status: "online"
        })
    }
}