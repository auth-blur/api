import {
    Injectable,
    HttpException,
    HttpStatus,
    Inject,
    forwardRef,
    BadRequestException,
} from "@nestjs/common";
import * as Jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import * as cache from "memory-cache";
import { ConfigService } from "@nestjs/config";
import { CodePayload, PicasscoResponse } from "picassco";
import { AuthorizationDTO } from "./dto/authorization.dto";
import { AppService } from "src/application/app.service";
import { TokenDTO } from "./dto/token.dto";
import { SnowflakeService, Type, AppFlag } from "@app/snowflake";
import { UserService } from "src/user/user.service";

export enum Scope {
    IDENTIFY = 1 << 0,
    EMAIL = 1 << 1,
    AVATARS = 1 << 2,
    AVATAR_DEFAULT = 1 << 3,
    AVATAR_UPLOAD = 1 << 4,
    ROOT = 1 << 5,
}

@Injectable()
export class OAuthService {
    public Scopes = {
        identify: 1 << 0,
        email: 1 << 1,
        "avatar.default": 1 << 2,
        avatars: 1 << 3,
        "avatar.upload": 1 << 4,
        root: 1 << 5,
    };

    constructor(
        @Inject(forwardRef(() => AppService))
        private readonly appService: AppService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly snowflake: SnowflakeService,
    ) {}

    serializationScope(scopes: string[]): number {
        let res = 0;
        for (const scope of scopes) res |= this.Scopes[scope];
        return res;
    }

    matchScope(validScope: Scope, scope: Scope): boolean {
        if ((scope & Scope.ROOT) == Scope.ROOT) return true;
        if ((validScope & scope) != validScope) return false;
        return true;
    }

    deserializationScope = (scope: number): string[] =>
        Object.entries(this.Scopes)
            .filter(f => f[1] === (f[1] & scope))
            .map(f => f[0]);

    genToken(
        payload: { id: number; scope: number },
        expiresIn: number = 30 * 24 * 60 * 60 * 1000,
    ): { access_token: string; expiresIn: number } {
        const access_token = Jwt.sign(
            payload,
            this.configService.get<string>("SECRET_KEY"),
            {
                algorithm: "HS512",
                expiresIn,
            },
        );
        return {
            access_token,
            expiresIn,
        };
    }

    genCode(ctx: CodePayload): string {
        const code = uuidv4();
        cache.put(code, ctx, 24 * 60 * 60 * 1000);
        return code;
    }

    getCode(code: string): CodePayload {
        const ctx = cache.get(code) as CodePayload;
        if (ctx) return;
        cache.del(code);
        return ctx;
    }

    async authorization({
        type,
        client_id,
        redirect_uri,
        scope,
        user_id,
    }: AuthorizationDTO): Promise<PicasscoResponse> {
        const [isExist, ClientApp] = await this.appService.isExistApplication(
            client_id,
        );
        if (!isExist) throw new Error("Unknown application");
        if (!ClientApp.redirects.includes(redirect_uri))
            throw new Error("Unknown redirect_uri");
        if (type === "code") {
            const scopeVal = this.serializationScope(
                scope.split(" ").map(s => s.trim()),
            );
            const code = this.genCode({
                clientID: client_id,
                redirectURI: redirect_uri,
                userID: user_id,
                scope: scopeVal,
            });
            return {
                redirect_uri,
                code,
            };
        }
        throw new Error("Invalid response_type");
    }

    async getToken({
        client_id,
        client_secret,
        grant_type,
        code,
        username,
        mail,
        password,
        redirect_uri,
    }: TokenDTO): Promise<{
        access_token: string;
        expiresIn: number;
        token_type: string;
    }> {
        const [isValid, ClientApp] = await this.appService.validateApplication({
            id: client_id,
            secret: client_secret,
        });
        if (!isValid)
            throw new HttpException(
                "Unknown Application",
                HttpStatus.BAD_REQUEST,
            );
        if (grant_type === "authorization_code") {
            const codeCtx = this.getCode(code);
            if (
                client_id !== codeCtx.clientID ||
                client_secret !== ClientApp.secret ||
                redirect_uri !== codeCtx.redirectURI
            )
                throw new HttpException(
                    "Invalid Application",
                    HttpStatus.BAD_REQUEST,
                );
            const { access_token, expiresIn } = this.genToken(
                {
                    id: codeCtx.userID,
                    scope: codeCtx.scope,
                },
                10 * 60 * 1000,
            );
            return {
                access_token,
                expiresIn,
                token_type: "Bearer",
            };
        }
        if (grant_type === "password") {
            this.snowflake.setType(Type.APP);
            this.snowflake.setFlags([AppFlag.VERIFIED]);
            const SID = this.snowflake.serialization(client_id);
            if (
                !SID.flags.includes("VERIFIED") &&
                !SID.flags.includes("SYSTEM")
            )
                throw new HttpException(
                    "Invalid Application",
                    HttpStatus.BAD_REQUEST,
                );
            const user = await this.userService.isCorrectPassword(
                mail ?? username,
                password,
            );
            const { access_token, expiresIn } = this.genToken({
                id: user.id,
                scope: this.Scopes.root,
            });
            return { access_token, expiresIn, token_type: "Bearer" };
        }
        throw new BadRequestException("unknown grant_type");
    }
}
