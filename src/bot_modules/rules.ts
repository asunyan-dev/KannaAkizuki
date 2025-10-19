import fs from "fs"
import path from "path"

const file = path.join(__dirname, "../bot_data/rules.json");

if(!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({rules: []}, null, 2));
};

function load() {
    let data = JSON.parse(fs.readFileSync(file, "utf8"));
    return data;
};

function save(data: any) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

export default {
    getRules() {
        const data = load();
        return data.rules || [];
    },

    addRule(title: string, details: string) {
        const data = load();
        const length = data.rules.length;
        data.rules.push(
            {
                number: length + 1,
                title: title,
                details: details
            }
        );
        save(data);
    },

    resetRules() {
        const data = load();
        data.rules = [];
        save(data);
    }
}