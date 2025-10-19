import { REST, Routes } from 'discord.js'
import fs from 'fs'
import 'dotenv/config'

const token = process.env.TOKEN!
const guildId = process.env.GUILD_ID!
const clientId = process.env.CLIENT_ID!

const commands: any[] = [];
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".ts"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
}

const rest = new REST({version: "10"}).setToken(token);

(async () => {
    try {
        console.log("⏳ Refreshing slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log("✅ Slash commands registered!");
    } catch (error) {
        console.error(error);
    }
})