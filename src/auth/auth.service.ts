import { Injectable } from "@nestjs/common";
import { PicasscoResponse } from "picassco";
import { SignupDTO } from "./dto/signup.dto";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) {}

    async signup({
        username,
        mail,
        password,
    }: SignupDTO): Promise<PicasscoResponse> {
        const { access_token, expiresIn } = await this.userService.createUser({
            username,
            mail,
            password,
        });
        return { message: "Successfully Registered", access_token, expiresIn };
    }
}
