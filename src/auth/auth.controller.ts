import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PicasscoResponse } from "picassco";
import { SignupDTO } from "./dto/signup.dto";

@Controller("/auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /*@Get("/whoami")
    whoami() {
        
    }*/

    @Post("/signup")
    async signup(@Body() body: SignupDTO): Promise<PicasscoResponse> {
        return this.authService.signup(body);
    }

    /*@Post()
    async signin() {

    }*/
}
