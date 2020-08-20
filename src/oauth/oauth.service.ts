import {
    Injectable,
    HttpException,
    HttpStatus,
    Inject,
    forwardRef,
    BadRequestException,
} from "@nestjs/common";
import * as Jwt from "jsonwebtoken";
import ms from "ms";
import Config from "src/config";
import { v4 as uuidv4 } from "uuid";
import { cache } from "memory-cache";
import { CodePayload, PicasscoResponse } from "picassco";
import { AuthorizationDTO } from "./dto/authorization.dto";
import { AppService } from "src/application/app.service";
import { TokenDTO } from "./dto/token.dto";
import { SnowFlakeFactory, Type, ClientFlag } from "src/libs/snowflake";
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

    genToken = (
        payload: { id: number; scope: unknown },
        expiresIn: number = ms("1y"),
    ): { access_token: string; expiresIn: number } => ({
        access_token: Jwt.sign(payload, Config().SECRET_KEY, {
            algorithm: "HS512",
            expiresIn,
        }),
        expiresIn,
    });

    genCode(ctx: CodePayload): string {
        const code = uuidv4();
        cache.put(code, ctx, ms("1d"));
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
        mail,
        password,
        redirect_uri,
    }: TokenDTO): Promise<PicasscoResponse> {
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
            const { access_token, expiresIn } = this.genToken({
                id: codeCtx.userID,
                scope: codeCtx.scope,
            });
            return {
                access_token,
                expiresIn,
            };
        }
        if (grant_type === "password") {
            const snowflake = new SnowFlakeFactory(
                [ClientFlag.VERIFIED],
                Type.CLIENT,
            );
            const SID = snowflake.serialization(client_id);
            if (!SID.flags.includes("VERIFIED"))
                throw new HttpException(
                    "Invalid Application",
                    HttpStatus.BAD_REQUEST,
                );
            const user = await this.userService.isCorrectPassword(
                mail,
                password,
            );
            const { access_token, expiresIn } = this.genToken({
                id: user.id,
                scope: this.Scopes.root,
            });
            return { access_token, expiresIn };
        }
        throw new BadRequestException("unknown grant_type");
    }
}
