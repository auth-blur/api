import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from "helmet"
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify"
import config from "./config"
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.use(helmet())
  app.enableCors()

  app.setGlobalPrefix(config().rootPath)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true
    })
  )
  await app.listen(config().port,"0.0.0.0");
}
bootstrap();
