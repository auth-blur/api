import { Module, forwardRef } from "@nestjs/common";
import { AvatarController } from "./avatar.controller";
import { AvatarService } from "./avatar.service";
import { SnowflakeModule } from "@app/snowflake";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/user/user.entity";
import { UserModule } from "src/user/user.module";
import { OAuthModule } from "src/oauth/oauth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        forwardRef(() => UserModule),
        SnowflakeModule,
        OAuthModule,
    ],
    controllers: [AvatarController],
    providers: [AvatarService],
    exports: [TypeOrmModule, AvatarService],
})
export class AvatarModule {}
