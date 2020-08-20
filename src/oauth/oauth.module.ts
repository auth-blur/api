import { Module } from "@nestjs/common";
import { OAuthController } from "./oauth.controller";
import { OAuthService } from "./oauth.service";

@Module({
    controllers: [OAuthController],
    providers: [OAuthService],
    exports: [OAuthService],
})
export class OAuthModule {}
