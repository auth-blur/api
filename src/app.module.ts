import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RateLimiterModule, RateLimiterGuard } from "nestjs-rate-limit";
import Config from "./config";
import { PingModule } from "./ping/ping.module";
import { UserModule } from "./user/user.module";
import { OAuthModule } from "./oauth/oauth.module";
import { ApplicationModule } from "./application/app.module";
import { AuthModule } from "./auth/auth.module";

@Module({
    imports: [
        RateLimiterModule.forRoot({
            points: 100,
            duration: 5,
            keyPrefix: "global",
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            load: [Config],
        }),
        TypeOrmModule.forRoot({
            type: "mongodb",
            url: Config().MONGODB_URI,
            database: "Picassco",
            synchronize: true,
            logger: "debug",
            useUnifiedTopology: true,
            useNewUrlParser: true,
            autoLoadEntities: true,
        }),
        PingModule,
        ApplicationModule,
        UserModule,
        OAuthModule,
        AuthModule,
    ],
    providers: [{ provide: APP_GUARD, useClass: RateLimiterGuard }],
})
export class AppModule {}
