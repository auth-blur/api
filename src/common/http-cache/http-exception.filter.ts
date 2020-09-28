import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import * as cache from "memory-cache";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const [req, res]: [FastifyRequest, FastifyReply] = [
            ctx.getRequest(),
            ctx.getResponse(),
        ];
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;
        const exRes = exception.getResponse();
        const id = cache.get(`request.${req.id}`);
        res.status(status).send(
            Object.assign({}, exRes, {
                id,
                statusCode: status,
            }),
        );
    }
}
