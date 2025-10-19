import { Client, Collection, Events, GatewayIntentBits, Partials } from "discord.js"
import fs from "fs"
import path from "path"
import "dotenv/config"


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildMember,
        Partials.User
    ]
});

client.cooldowns = new Collection();
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.existsSync(commandsPath) ? fs.readdirSync(commandsPath).filter(file => file.endsWith(".ts")) : [];


for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`[WARNING] The command at ${file} is missing "data" or "execute`);
    };
};


const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.existsSync(eventsPath) ? fs.readdirSync(eventsPath).filter(file => file.endsWith(".ts")) : [];

for (const file of eventFiles) {
    const event = require (path.join(eventsPath, file));

    if(event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    };
};




client.login(process.env.TOKEN)