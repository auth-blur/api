import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { validate } from "uuid";
import cache from "memory-cache";

export const HttpCache = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        if (validate(data)) {
            return cache.get(`web.logs.${data}`);
        }
        const req = ctx.switchToHttp().getRequest();
        return cache.get(`web.logs.${req.id}`);
    },
);
