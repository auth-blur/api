import { TConfig } from "picassco";

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
