import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppEntity } from "./app.entity";

@Module({
    imports: [TypeOrmModule.forFeature([AppEntity])],
    controllers: [AppController],
    providers: [AppService],
    exports: [TypeOrmModule, AppService],
})
export class DeveloperModule {}
