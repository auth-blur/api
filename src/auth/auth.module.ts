import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "src/user/user.module";
import { OAuthModule } from "src/oauth/oauth.module";
import { SnowflakeModule } from "@app/snowflake";

@Module({
    imports: [UserModule, OAuthModule, SnowflakeModule],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
