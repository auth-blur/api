import { HttpStatus, Logger } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import * as cache from "memory-cache";
import { v4 as uuidv4 } from "uuid";

export async function HttpCacheMiddleware(
    req: FastifyRequest,
    res: FastifyReply,
    next: () => void,
): Promise<void> {
    const begin = process.hrtime();
    cache.put(`request.${req.id}`, uuidv4(), 5000);
    req.id = uuidv4();
    const timeout = setTimeout(() => {
        return res.status(HttpStatus.REQUEST_TIMEOUT).send({
            statusCode: HttpStatus.REQUEST_TIMEOUT,
            message: "Request Timeout",
            id: req.id,
        });
    }, 5000);
    await next();
    clearTimeout(timeout);
    const time = process.hrtime(begin);
    if (req.url === "/v1/health") return;
    const data = {
        id: req.id,
        address: req.hostname,
        url: req.url,
        method: req.method,
        status: res.statusCode,
        ip: req.ip,
        time: time[0] + time[1] / 10 ** 6,
        agent: req.headers["user-agent"],
        cookie: req.headers["cookie"],
    };
    cache.put(`web.logs.${data.id}`, data, 6 * 3600 * 1000);
    Logger.debug(`{${data.url}, ${data.method}:${data.status}}`, "Web-Log");
}
