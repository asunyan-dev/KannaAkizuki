import fs from "fs";
import path from "path";

const file = path.join(__dirname, "../bot_data/reputation.json");

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
    if(!data[userId]) data[userId] = 0;
};


export function getRep(userId: string) {
    const data = load();
    ensureUser(data, userId);
    return data[userId];
};

export function addRep(userId: string) {
    const data = load();
    ensureUser(data, userId);
    data[userId] += 1;
    save(data);
};

