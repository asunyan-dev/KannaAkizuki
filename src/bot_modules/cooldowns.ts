import fs from "fs"
import path from "path"

const file = path.join(__dirname, "../bot_data/cooldowns.json");

if(!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2));
};

function load() {
    let data = JSON.parse(fs.readFileSync(file, "utf8"));
    return data;
};

function save(data: any) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

function ensureCooldown(data: any, userId: string, commandName: string) {
    if(!data[userId]) data[userId] = {};

    if(!data[userId][commandName]) {
        data[userId][commandName] = Date.now();
    };
};

export default {
    getCooldown(userId: string, commandName: string) {
        const data = load();
        ensureCooldown(data, userId, commandName);
        return data[userId][commandName];
    },
    setCooldown(userId: string, commandName: string, amount: number) {
        const data = load();
        ensureCooldown(data, userId, commandName);
        data[userId][commandName] = Date.now() + amount;
        save(data);
    }
}