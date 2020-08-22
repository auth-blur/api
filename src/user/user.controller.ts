import {
    Controller,
    Get,
    Patch,
    Delete,
    UseGuards,
    Body,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.decorator";
import { PicasscoResponse, PicasscoReqUser } from "picassco";
import { OAuthGuard } from "src/oauth/oauth.guard";
import { UserPatchDTO } from "./dto/patch-user.dto";

@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("@me")
    @UseGuards(OAuthGuard)
    async getMyData(@User() user: PicasscoReqUser): Promise<PicasscoResponse> {
        return { user };
    }

    @Patch("@me")
    @UseGuards(OAuthGuard)
    async patchMyData(
        @Body() body: UserPatchDTO,
        @User() user: PicasscoReqUser,
    ): Promise<PicasscoResponse> {
        return this.userService.patchUser(body, user);
    }

    @Delete("@me")
    @UseGuards(OAuthGuard)
    async deleteMe(@User() user: PicasscoReqUser): Promise<PicasscoResponse> {
        return this.userService.deleteUser(user.id);
    }
}
