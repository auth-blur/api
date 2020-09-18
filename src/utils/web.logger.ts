import { FastifyReply, FastifyRequest } from "fastify";
import { Logger } from "@nestjs/common";
import * as cache from "memory-cache";
import { v4 as uuidv4 } from "uuid";

export const Handler = async (
    req: FastifyRequest,
    res: FastifyReply,
    next: () => void,
): Promise<void> => {
    const begin = process.hrtime();
    await next();
    const time = process.hrtime(begin);
    if (req.url === "/v1/health") return;
    const data = {
        id: uuidv4(),
        address: req.hostname,
        url: req.url,
        method: req.method,
        status: res.statusCode,
        ip: req.ip,
        time: time[0] + time[1] / 10 ** 6,
        agent: req.headers["user-agent"],
    };
    cache.put(`web.logs.${data.id}`, data, 6 * 3600 * 1000);
    Logger.debug(`{${data.url}, ${data.method}:${data.status}}`, "Web-Log");
};
