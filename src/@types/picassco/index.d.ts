declare module "picassco" {
    import { ISnowflake } from "@app/snowflake";

    export type TConfig = {
        PORT: number;
        ROOT_PATH: string;
        MONGODB_URI: string;
        SECRET_KEY: string;
        isProd: boolean;
        App: {
            id: number;
            secret: string;
        };
        flyioToken: string;
        mail: string;
        sgKey: string;
        Firebase: {
            apiKey: string;
            authDomain: string;
            databaseURL: string;
            projectId: string;
            storageBucket: string;
            messagingSenderId: string;
            appId: string;
            measurementId: string;
        };
    };

    export interface PicasscoResponse {
        message?: string;
        [propName: string]: unknown;
    }

    export interface PicasscoRequest {
        user?: PicasscoReqUser;
        [prop: string]: any;
    }

    export interface PicasscoReqUser extends TokenPayload {
        flags: number;
        SID: ISnowflake;
    }
    export interface TokenPayload {
        id: number;
        scope: number;
    }

    export interface CodePayload {
        clientID: number;
        redirectURI: string;
        userID: number;
        scope: number;
    }
}
