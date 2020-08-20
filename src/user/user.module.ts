import { Module, forwardRef } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { OAuthModule } from "src/oauth/oauth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        forwardRef(() => OAuthModule),
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [TypeOrmModule, UserService],
})
export class UserModule {}
