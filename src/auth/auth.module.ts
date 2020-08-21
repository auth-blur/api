import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "src/user/user.module";
import { OAuthModule } from "src/oauth/oauth.module";

@Module({
    imports: [UserModule, OAuthModule],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
