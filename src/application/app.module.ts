import { Module, forwardRef } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppEntity } from "./app.entity";
import { OAuthModule } from "src/oauth/oauth.module";
import { UserModule } from "src/user/user.module";
import { SnowflakeModule } from "@app/snowflake";

@Module({
    imports: [
        TypeOrmModule.forFeature([AppEntity]),
        forwardRef(() => OAuthModule),
        forwardRef(() => UserModule),
        SnowflakeModule,
    ],
    controllers: [AppController],
    providers: [AppService],
    exports: [TypeOrmModule, AppService],
})
export class ApplicationModule {}
