import { Module, forwardRef } from "@nestjs/common";
import { OAuthController } from "./oauth.controller";
import { OAuthService } from "./oauth.service";
import { ApplicationModule } from "src/application/app.module";
import { UserModule } from "src/user/user.module";
import { SnowflakeModule } from "@app/snowflake";

@Module({
    imports: [
        forwardRef(() => ApplicationModule),
        forwardRef(() => UserModule),
        SnowflakeModule,
    ],
    controllers: [OAuthController],
    providers: [OAuthService],
    exports: [OAuthService],
})
export class OAuthModule {}
