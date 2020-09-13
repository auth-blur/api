import {
    Injectable,
    CanActivate,
    Inject,
    forwardRef,
    ExecutionContext,
    HttpStatus,
} from "@nestjs/common";
import { TokenPayload } from "picassco";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import * as Jwt from "jsonwebtoken";
import * as cache from "memory-cache";
import { SnowflakeService, UserFlag, Type } from "@app/snowflake";
import { UserService } from "src/user/user.service";
import { OAuthService } from "./oauth.service";

@Injectable()
export class OAuthGuard implements CanActivate {
    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly oauthService: OAuthService,
        private readonly snowflakeService: SnowflakeService,
        private readonly configService: ConfigService,
        private reflector: Reflector,
    ) {
        this.snowflakeService.setFlags([UserFlag.ACTIVE_USER]);
        this.snowflakeService.setType(Type.USER);
    }

    errHandler(res: { [prop: string]: any }): void {
        res.status(HttpStatus.UNAUTHORIZED).send({
            err: {
                message: "Unauthorized Request: User Not Found",
            },
        });
    }

    succHandler(
        req: { [prop: string]: any },
        data: { [prop: string]: any },
    ): void {
        req.user = Object.assign({}, data, {
            SID: this.snowflakeService.serialization(data.id),
        });
    }

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
            this.configService.get<string>("SECRET_KEY"),
            async (err, decoded: TokenPayload) => {
                if (err)
                    return res
                        .status(HttpStatus.BAD_REQUEST)
                        .send({ err: { message: "Invalid access_token" } });
                if (cache.get(decoded.id) === false)
                    return this.errHandler(res);
                else if (cache.get(decoded.id) === true)
                    this.succHandler(req, decoded);
                else {
                    const isExist = await this.userService.isExist(decoded.id);
                    cache.put(decoded.id, isExist, 6 * 24 * 60 * 60 * 1000);
                    if (!isExist) return this.errHandler(res);
                    this.succHandler(req, decoded);
                }
            },
        );

        if (flags && !SnowflakeService.matchFlags(flags, req.user.id))
            return false;
        if (scope && !this.oauthService.matchScope(scope, req.user.scope))
            return false;
        return true;
    }
}
