import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EarlyMailEntity } from "./early-mail.entity";
import { EarlyController } from "./early.controller";
import { MailService } from "./mail.service";

@Module({
    imports: [TypeOrmModule.forFeature([EarlyMailEntity])],
    controllers: [EarlyController],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
