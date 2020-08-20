import { Module } from "@nestjs/common";
import { DeveloperController } from "./developer.controller";
import { DeveloperService } from "./developer.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientEntity } from "./client.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ClientEntity])],
    controllers: [DeveloperController],
    providers: [DeveloperService],
    exports: [TypeOrmModule, DeveloperService],
})
export class DeveloperModule {}
