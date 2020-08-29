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
import { Scopes } from "src/oauth/scope.decorator";
import { Scope } from "src/oauth/oauth.service";
import { PicasscoResponse, PicasscoReqUser } from "picassco";
import { OAuthGuard } from "src/oauth/oauth.guard";
import { UserPatchDTO } from "./dto/patch-user.dto";
import { UserEntity } from "./user.entity";

@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Scopes(Scope.IDENTIFY)
    @Get("@me")
    @UseGuards(OAuthGuard)
    async getMyData(
        @User() user: PicasscoReqUser,
    ): Promise<PicasscoResponse | UserEntity> {
        return await this.userService.getMyData(user.id,user.scope);
    }

    @Scopes(Scope.ROOT)
    @Patch("@me")
    @UseGuards(OAuthGuard)
    async patchMyData(
        @Body() body: UserPatchDTO,
        @User() user: PicasscoReqUser,
    ): Promise<PicasscoResponse> {
        return this.userService.patchUser(body, user);
    }

    @Scopes(Scope.ROOT)
    @Delete("@me")
    @UseGuards(OAuthGuard)
    async deleteMe(@User() user: PicasscoReqUser): Promise<PicasscoResponse> {
        return this.userService.deleteUser(user.id);
    }
}
