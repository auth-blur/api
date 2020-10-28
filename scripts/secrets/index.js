const fetch = require("node-fetch").default;
const fs = require("fs");

const isProd = process.env.NODE_ENV === "production";

if (!isProd) require("dotenv").config();

const mode = process.argv[2] || "process-write";

const shouldWrite = ["write", "process-write"].includes(mode);
const shouldProcess = ["process", "process-write"].includes(mode);

const { TOKEN, APP_NAME, KEY } = process.env;

const BASE_URL = "https://secret.picass.co/v1/";

let didErr = false;

const getSecrets = async () => {
    console.log("Fetching secrets...");
    if(!(BASE_URL&&APP_NAME&&KEY)) throw new Error("Missing environments: BASE_URL, APP_NAME or KEY ")
    const { data } = await (
        await fetch([BASE_URL, APP_NAME, "data", KEY].join("/"), {
            headers: {
                "x-vault-token": TOKEN,
            },
        })
    ).json();
    const secrets = data.data;
    console.log(`Successfully fetched ${Object.keys(secrets).length} secrets`);
    return secrets;
};

(async () => {
    try {
        const secrets = await getSecrets();
        if (shouldWrite) {
            const parserSecret = (() => {
                let r = [];
                for (const k in secrets) {
                    r.push(`${k}=${secrets[k]}`);
                }
                return r.join("\n");
            })();
            fs.writeFileSync("./.env", parserSecret, { encoding: "utf-8" });
            console.log("Secrets written to .env file");
        }
        if (shouldProcess) {
            for (const k in secrets) {
                process.env[k] = secrets[k];
            }
            console.log("Secrets added process");
        }
    } catch (e) {
        didErr = true;
        console.log(e);
    }
})();

if (didErr) {
    process.exit(1);
}
