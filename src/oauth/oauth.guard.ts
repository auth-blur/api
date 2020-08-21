import {
    Injectable,
    CanActivate,
    Inject,
    forwardRef,
    ExecutionContext,
    HttpStatus,
} from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { Reflector } from "@nestjs/core";
import * as Jwt from "jsonwebtoken";
import Config from "src/config";
import { TokenPayload } from "picassco";
import { matchFlags } from "src/libs/snowflake";
import { OAuthService } from "./oauth.service";

@Injectable()
export class OAuthGuard implements CanActivate {
    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly oauthService: OAuthService,
        private reflector: Reflector,
    ) {}

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const flags = this.reflector.get<number>("flags", ctx.getHandler());
        const scope = this.reflector.get<number>("scope", ctx.getHandler());
        const [req, res] = [
            ctx.switchToHttp().getRequest(),
            ctx.switchToHttp().getResponse(),
        ];
        let token: string =
            req.headers["x-access-token"] ||
            req.headers["authorization"] ||
            req.query["access_token"];

        if (!token) return false;
        token = token.startsWith("Bearer")
            ? token.match(/[^Bearer]\S+/g)[0].trim()
            : token;

        await Jwt.verify(
            token,
            Config().SECRET_KEY,
            async (err, decoded: TokenPayload) => {
                if (err)
                    return res
                        .status(HttpStatus.BAD_REQUEST)
                        .send({ err: { message: "Invalid access_token" } });
                const isExist = await this.userService.isExist(decoded.id);
                if (!isExist)
                    return res.status(HttpStatus.UNAUTHORIZED).send({
                        err: {
                            message: "Unauthorized Request: User Not Found",
                        },
                    });
                req.user = Object.assign({}, decoded, {
                    flags: (decoded.id & 0x1f000) >> 12,
                });
            },
        );

        if (flags && !matchFlags(flags, req.user.id)) return false;
        if (scope && !this.oauthService.matchScope(scope, req.user.scope))
            return false;
        return true;
    }
}
