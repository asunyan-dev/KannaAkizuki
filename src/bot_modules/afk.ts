import fs from "fs"
import path from "path"

const file = path.join(__dirname, "../bot_data/afk.json");

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

export default {
    setAfk(userId: string, reason: string) {
        const data = load();
        data[userId] = {
            afk: true,
            reason: reason
        };
        save(data);
    },

    getAfk(userId: string) {
        const data = load();
        if(!data[userId]) return {afk: false} 
        return { afk: data[userId].afk, reason: data[userId].reason };
    }, 

    removeAfk(userId: string) {
        const data = load();
        delete data[userId];
        save(data);
    }
}