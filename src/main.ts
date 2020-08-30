import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import * as helmet from "fastify-helmet";
import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify";
import config from "./config";
import { AppModule } from "./app.module";
import * as morgan from "morgan";
import * as multer from "fastify-multer";

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
    );
    app.getHttpAdapter()
        .getInstance()
        .register(multer.contentParser)
        .register(helmet);
    app.enableCors();
    app.use(morgan("dev"));
    app.setGlobalPrefix(config().ROOT_PATH);
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );
    await app.listen(config().PORT, "0.0.0.0");
}
bootstrap();
