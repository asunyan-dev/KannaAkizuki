import fs from "fs";
import path from "path";


const file = path.join(__dirname, "../bot_data/blacklist.json");

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


export function blacklist(userId: string) {
    const data = load();
    data[userId] = true;
    save(data);
};

export function whitelist(userId: string) {
    const data = load();
    data[userId] = false;
    save(data);
}