import { Module, forwardRef } from "@nestjs/common";
import { OAuthController } from "./oauth.controller";
import { OAuthService } from "./oauth.service";
import { ApplicationModule } from "../application/app.module";
import { UserModule } from "src/user/user.module";

@Module({
    imports: [ApplicationModule, forwardRef(() => UserModule)],
    controllers: [OAuthController],
    providers: [OAuthService],
    exports: [OAuthService],
})
export class OAuthModule {}
