import { Injectable } from "@nestjs/common";
import { PicasscoResponse } from "picassco";
import { SignupDTO } from "./dto/signup.dto";
import { UserService } from "../user/user.service";
import { SigninDTO } from "./dto/signin.dto";
import { OAuthService } from "src/oauth/oauth.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly oauthService: OAuthService,
        private readonly configService: ConfigService,
    ) {}

    async signup({
        username,
        mail,
        password,
    }: SignupDTO): Promise<
        PicasscoResponse & { access_token: string; expiresIn: number }
    > {
        const { access_token, expiresIn } = await this.userService.createUser({
            username,
            mail,
            password,
        });
        return { message: "Successfully Registered", access_token, expiresIn };
    }

    async signin({
        mail,
        password,
    }: SigninDTO): Promise<
        PicasscoResponse & { access_token: string; expiresIn: number }
    > {
        const { access_token, expiresIn } = await this.oauthService.getToken({
            client_id: this.configService.get<number>("App.id"),
            client_secret: this.configService.get<string>("App.secret"),
            grant_type: "password",
            mail,
            password,
        });
        return { access_token, expiresIn };
    }
}
