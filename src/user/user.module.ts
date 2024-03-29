import { Module, forwardRef } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { OAuthModule } from "src/oauth/oauth.module";
import { SnowflakeModule } from "@app/snowflake";
import { AppEntity } from "src/application/app.entity";
import { AvatarModule } from "src/avatar/avatar.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, AppEntity]),
        forwardRef(() => AvatarModule),
        forwardRef(() => OAuthModule),
        SnowflakeModule,
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [TypeOrmModule, UserService],
})
export class UserModule {}
