import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import helmet from "fastify-helmet";
import * as csurf from "csurf";
import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify";
import config from "./config";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
    );
    app.register(helmet);
    app.use(csurf());
    app.enableCors();

    app.setGlobalPrefix(config().ROOT_PATH);
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );
    await app.listen(config().PORT, "0.0.0.0");
}
bootstrap();
