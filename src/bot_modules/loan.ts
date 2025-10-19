import fs from "fs";
import path from "path";

const file = path.join(__dirname, "../bot_data/loan.json");

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
            loan: false,
            amount: null,
            nextDue: null,
            due: null
        };
    };
};

export default {
    getLoan(userId: string) {
        const data = load();
        ensureUser(data, userId);
        return data[userId];
    },

    addLoan(userId: string, amount: number, nextDue: number, due: number) {
        const data = load();
        ensureUser(data, userId);
        data[userId] = {
            loan: true,
            amount: amount,
            nextDue: nextDue,
            due: due
        };
        save(data);    
    },

    editNextDue(userId: string, nextDue: number) {
        const data = load();
        ensureUser(data, userId);
        data[userId].nextDue = nextDue;
        save(data);
    },

    editDue(userId: string, due: number) {
        const data = load();
        ensureUser(data, userId);
        data[userId].due = due;
        save(data);
    },

    endLoan(userId: string) {
        const data = load();
        ensureUser(data, userId);
        delete data[userId];
        save(data);
    }
}