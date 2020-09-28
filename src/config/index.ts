import { TConfig } from "picassco";
import * as fs from "fs";

const isProd = process.env.NODE_ENV === "production";
if (isProd) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { parse } = require("dotenv");
    fs.readdirSync("./")
        .filter(f => f.match(/^([a-zA-Z]{1,16}\.)+(prod|production).env$/g))
        .forEach(f => {
            const env = parse(fs.readFileSync(`./${f}`));
            for (const k in env) process.env[k] = env[k];
        });
}

export default (): TConfig => ({
    PORT: parseInt(process.env.PORT) || 3000,
    ROOT_PATH: process.env.ROOT_PATH || "/v1",
    MONGODB_URI: process.env.MONGODB_URI,
    SECRET_KEY: process.env.SECRET_KEY,
    isProd: process.env.NODE_ENV === "production",
    App: {
        id: parseInt(process.env.APP_ID),
        secret: process.env.APP_SECRET,
    },
    flyioToken: process.env.FLYIO_TOKEN,
    sgKey: process.env.SG_KEY,
    mail: "noreply@picass.co",
    Firebase: {
        apiKey: process.env.FB_API_KEY,
        authDomain: process.env.FB_AUTH_DOMAIN,
        databaseURL: process.env.FB_DB_URL,
        projectId: process.env.FB_PROJECT_ID,
        storageBucket: process.env.FB_STORAGE_BUCKET,
        messagingSenderId: process.env.FB_MSG_SENDER_ID,
        appId: process.env.FB_APP_ID,
        measurementId: process.env.FB_MSRMT_ID,
    },
});
