declare module "picassco" {
    export type TConfig = {
        PORT: number;
        ROOT_PATH: string;
        MONGODB_URI: string;
        SECRET_KEY: string;
        App: {
            id: string;
            secret: string;
        };
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

    export interface TokenPayload {
        id: number;
        scope: any;
    }

    export interface CodePayload {
        clientID: number;
        redirectURI: string;
        userID: number;
        scope: number;
    }
}
