import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.decorator";
import { PicasscoResponse, PicasscoReqUser } from "picassco";
import { OAuthGuard } from "src/oauth/oauth.guard";

@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("@me")
    @UseGuards(OAuthGuard)
    async getMyData(@User() user: PicasscoReqUser): Promise<PicasscoResponse> {
        return { user };
    }
}
