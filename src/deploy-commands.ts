import { REST, Routes } from 'discord.js'
import fs from 'fs'
import 'dotenv/config'
import path from "path"

const token = process.env.TOKEN!
const guildId = process.env.GUILD_ID!
const clientId = process.env.CLIENT_ID!

const commands: any[] = [];
const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".ts"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath).default;
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
})()