import {
    Controller,
    Put,
    UseGuards,
    Get,
    Param,
    Body,
    Delete,
} from "@nestjs/common";
import { AppService } from "./app.service";
import { PicasscoResponse, PicasscoReqUser } from "picassco";
import { User } from "src/user/user.decorator";
import { OAuthGuard } from "src/oauth/oauth.guard";
import { AppEntity } from "./app.entity";
import { UserEntity } from "src/user/user.entity";
import { CreateAppDTO } from "./dto/create-app.dto";

@Controller("apps")
export class AppController {
    constructor(private readonly appService: AppService) {}

    @UseGuards(OAuthGuard)
    @Put()
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

    @Get("@me")
    @UseGuards(OAuthGuard)
    async getUserApps(
        @User() user: PicasscoReqUser,
    ): Promise<(AppEntity & { owner: UserEntity })[]> {
        return await this.appService.getAllApplications({ user });
    }

    @Delete(["id/:id", ""])
    @UseGuards(OAuthGuard)
    async delApp(
        @Body("id") bodyID: number,
        @Param("id") paramID: number,
        @User() user: PicasscoReqUser,
    ): Promise<PicasscoResponse> {
        return this.appService.deleteApp({ id: paramID || bodyID, user });
    }
}
