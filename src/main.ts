import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import * as helmet from "fastify-helmet";
import * as multer from "fastify-multer";
import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify";
import config from "./config";
import { AppModule } from "./app.module";
import { HttpCacheMiddleware } from "./common/http-cache/http-cache.middleware";
import { HttpExceptionFilter } from "./common/http-cache/http-exception.filter";

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
    );
    app.use(HttpCacheMiddleware);
    app.getHttpAdapter()
        .getInstance()
        .register(multer.contentParser)
        .register(helmet);
    app.enableCors();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.setGlobalPrefix(config().ROOT_PATH);
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );
    await app.listen(config().PORT, "0.0.0.0");
}
bootstrap();
