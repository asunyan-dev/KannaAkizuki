import fs from "fs"
import path from "path"

const file = path.join(__dirname, "../bot_data/job.json");

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
            job: false,
            name: null,
            daily: 0
        };
    };
};


export default {
    setJob(userId: string, jobName: string, dailyPay: number) {
        const data = load();
        ensureUser(data, userId);
        data[userId] = {
            job: true,
            name: jobName,
            daily: dailyPay
        };
        save(data);
    },

    getJob(userId: string) {
        const data = load();
        ensureUser(data, userId);
        return data[userId];
    },

    removeJob(userId: string) {
        const data = load();
        ensureUser(data, userId);
        delete data[userId];
        save(data);
    }
}