import {
    Controller,
    Put,
    UseGuards,
    Get,
    Patch,
    Param,
    Body,
    Delete,
    Post,
} from "@nestjs/common";
import { AppService } from "./app.service";
import { PicasscoResponse, PicasscoReqUser } from "picassco";
import { User } from "src/user/user.decorator";
import { OAuthGuard } from "src/oauth/oauth.guard";
import { AppEntity } from "./app.entity";
import { UserEntity } from "src/user/user.entity";
import { CreateAppDTO } from "./dto/create-app.dto";
import { AppPatchDTO } from "./dto/patch-app.dto";
import { Scopes } from "src/oauth/scope.decorator";
import { Scope } from "src/oauth/oauth.service";

@Controller("apps")
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Scopes(Scope.ROOT)
    @UseGuards(OAuthGuard)
    @Put()
    @Post()
    async createApplication(
        @Body() appBody: CreateAppDTO,
        @User() user: PicasscoReqUser,
    ): Promise<PicasscoResponse> {
        return this.appService.createApp({ ...appBody, user });
    }

    @Get("id/:id")
    async getApp(@Param("id") id: number): Promise<PicasscoResponse> {
        return await this.appService.getApplication({ id });
    }

    @Scopes(Scope.ROOT)
    @Get("@me")
    @UseGuards(OAuthGuard)
    async getUserApps(
        @User() user: PicasscoReqUser,
    ): Promise<(AppEntity & { owner: UserEntity })[]> {
        return await this.appService.getAllApplications({ user });
    }

    @Scopes(Scope.ROOT)
    @Delete(["id/:id", ""])
    @UseGuards(OAuthGuard)
    async delApp(
        @Body("id") bodyID: number,
        @Param("id") paramID: number,
        @User() user: PicasscoReqUser,
    ): Promise<PicasscoResponse> {
        return this.appService.deleteApp({ id: paramID || bodyID, user });
    }

    @Scopes(Scope.ROOT)
    @Patch("id/:id")
    @UseGuards(OAuthGuard)
    async patchApp(
        @Param("id") id: number,
        @Body() body: AppPatchDTO,
        @User() user: PicasscoReqUser,
    ): Promise<PicasscoResponse> {
        return this.appService.patchApp(id, body, user);
    }
}
