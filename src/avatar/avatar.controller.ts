import {
    Controller,
    Get,
    Param,
    Delete,
    Put,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    Header,
    Query,
} from "@nestjs/common";
import { AvatarService } from "./avatar.service";
import { User } from "src/user/user.decorator";
import { PicasscoReqUser, PicasscoResponse } from "picassco";
import { GetAvatarDto } from "./dto/get-avatar.dto";
import { FileInterceptor } from "@webundsoehne/nest-fastify-file-upload";
import { OAuthGuard } from "src/oauth/oauth.guard";

@Controller("/avatars")
export class AvatarController {
    constructor(private readonly avatarService: AvatarService) {}

    @Put("/@me")
    @UseInterceptors(FileInterceptor("file"))
    @UseGuards(OAuthGuard)
    async uploadAvatar(
        @User() user: PicasscoReqUser,
        @UploadedFile() file: unknown,
    ): Promise<PicasscoResponse> {
        return await this.avatarService.uploadUser(file, user);
    }

    @Get("/:userID")
    @Header("Content-Type","image/webp")
    async getUserAvatar(
        @Param("userID") userID: number,
        @Query("size") size?: number
    ): Promise<Buffer> {
        return await this.avatarService.get({ userID,size });
    }

    @Get("/:userID/:avatarID")
    @Header("Content-Type","image/webp")
    async getAvatar(@Param() params: GetAvatarDto,@Query("size") size?: number): Promise<Buffer> {
        return await this.avatarService.get({...params,size});
    }

    @UseGuards(OAuthGuard)
    @Get("/@me")
    @Header("Content-Type","image/webp")
    async getMyAvatar(@User() user: PicasscoReqUser,@Query("size") size?: number): Promise<Buffer> {
        return await this.avatarService.get({ userID: user.id,size })
    }

    @UseGuards(OAuthGuard)
    @Get("/@me/:avatarID")
    @Header("Content-Type","image/webp")
    async getMyAvatarWithID(
        @User() user: PicasscoReqUser,
        @Param("avatarID") avatarID: number,
        @Query("size") size?: number
    ): Promise<Buffer> {
        return await this.avatarService.get({ userID: user.id, avatarID,size });
    }

    @Delete("/@me/:avatarID",)
    @UseGuards(OAuthGuard)
    async delMyAvatar(
        @Param("avatarID") avatarID: number,
        @User() user: PicasscoReqUser,
    ): Promise<PicasscoResponse> {
        return await this.avatarService.delete(
            user.id,
            avatarID,
        );
    }
}
