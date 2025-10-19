import fs from "fs"
import path from "path"


const file = path.join(__dirname, "../bot_data/botLogs.json");

if(!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({logs: []}, null, 2));
};

function load() {
    let data = JSON.parse(fs.readFileSync(file, "utf8"));
    return data;
};

function save(data: any) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

export default {
    getLogs() {
        const data = load();
        return data.logs || [];
    },

    addLog(version: string, details: string) {
        const data = load()
        data.logs.push(
            {
                version: version,
                details: details
            }
        );
        save(data);
    },

    resetLogs() {
        const data = load()
        data.logs = [];
        save(data);
    }
}