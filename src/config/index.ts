import { TConfig } from "picassco";
import { execSync } from "child_process"
import { Logger } from "@nestjs/common"

const isProd = process.env.NODE_ENV === "production";

if (isProd && !process.env.SECRET_KEY) {
    Logger.debug("Fetching undetectable environments","Environment")
    execSync("npm run secret:write process")
}

export default (): TConfig =>  {
    return {
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
    }
};
