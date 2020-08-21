import { Controller, Post, Body, UseGuards, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PicasscoResponse, PicasscoReqUser } from "picassco";
import { SignupDTO } from "./dto/signup.dto";
import { SigninDTO } from "./dto/signin.dto";
import { OAuthGuard } from "src/oauth/oauth.guard";
import { User } from "src/user/user.decorator";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get("whoami")
    @UseGuards(OAuthGuard)
    whoami(@User() user:PicasscoReqUser):PicasscoReqUser {
        return user
    }

    @Post("/signup")
    async signup(@Body() body: SignupDTO): Promise<PicasscoResponse> {
        return await this.authService.signup(body);
    }

    @Post("/signin")
    async signin(@Body() body: SigninDTO):Promise<PicasscoResponse> {
        return await this.authService.signin(body)
    }
}
