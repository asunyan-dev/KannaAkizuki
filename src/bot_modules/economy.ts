import fs from "fs"
import path from "path"

const file = path.join(__dirname, "../bot_data/economy.json");

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

function ensureUser(data: any, userId: string) {
    if(!data[userId]) {
        data[userId] = {
            balance: 0,
            luls: 0
        };
        save(data);
    };
};

export default {
    getBalance(userId: string) {
        const data = load();
        ensureUser(data, userId);
        return data[userId].balance;
    },

    setBalance(userId: string, amount: any) {
        const data = load();
        ensureUser(data, userId);
        data[userId].balance = Number(amount);
        save(data);
    },

    addBalance(userId: string, amount: any) {
        const data = load();
        ensureUser(data, userId);
        data[userId].balance += Number(amount);
        save(data);
    },

    removeBalance(userId: string, amount: any) {
        const data = load();
        ensureUser(data, userId);
        data[userId].balance -= Number(amount);
        save(data);
    },

    getLuls(userId: string) {
        const data = load();
        ensureUser(data, userId);
        return data[userId].luls;
    },

    addLuls(userId: string, amount: any) {
        const data = load();
        ensureUser(data, userId);
        data[userId].luls += Number(amount);
        save(data);
    },

    resetLuls(userId: string) {
        const data = load()
        ensureUser(data, userId);
        data[userId].luls = 0;
        save(data);
    },

    getAll() {
        const data = load();
    }
}