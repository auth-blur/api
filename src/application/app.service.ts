import {
    Injectable,
    NotFoundException,
    NotAcceptableException,
    Inject,
    forwardRef,
} from "@nestjs/common";
import { MongoRepository } from "typeorm";
import { AppEntity } from "./app.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { PicasscoResponse, PicasscoReqUser } from "picassco";
import { SnowflakeService, AppFlag, Type } from "@app/snowflake";
import { v4 as uuidv4 } from "uuid";
import { UserService } from "src/user/user.service";
import { UserEntity } from "src/user/user.entity";
import { plainToClass } from "class-transformer";
import { CreateAppDTO } from "./dto/create-app.dto";
import { AppPatchDTO } from "./dto/patch-app.dto";

@Injectable()
export class AppService {
    constructor(
        @InjectRepository(AppEntity)
        private readonly appRepository: MongoRepository<AppEntity>,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly snowflake: SnowflakeService,
    ) {
        this.snowflake.setType(Type.APP);
        this.snowflake.setFlags([AppFlag.NORMAL]);
    }

    async isExistApplication(
        id: number,
        owner?: number,
    ): Promise<[boolean, AppEntity]> {
        const ClientApp = owner
            ? await this.appRepository.findOne({ id, owner })
            : await this.appRepository.findOne({ id });
        return [!!ClientApp, ClientApp];
    }

    async validateApplication(ctx: {
        id: number;
        secret: string;
    }): Promise<[boolean, AppEntity]> {
        const ClientApp = await this.appRepository.findOne(ctx);
        let isValid = true;
        if (!ClientApp) isValid = false;
        return [isValid, ClientApp];
    }

    async getApplication({
        id,
        user,
    }: {
        id: number;
        user?: PicasscoReqUser;
    }): Promise<PicasscoResponse & AppEntity & { owner: UserEntity }> {
        const app = await this.appRepository.findOne({ id });
        if (!app) throw new NotFoundException("Application Not Found");
        const userCond = user && user.id !== app.owner;
        const owner = userCond
            ? await this.userService.getUser(app.owner)
            : await this.userService.getMyData(app.owner);
        return {
            ...Object.assign(plainToClass(AppEntity, app), {
                owner,
                secret: user && user.id === app.owner ? undefined : app.secret,
            }),
        };
    }

    async getAllApplications({
        user,
    }: {
        user: PicasscoReqUser;
    }): Promise<(AppEntity & { owner: UserEntity })[]> {
        const apps = await this.appRepository.find({ owner: user.id });
        const owner = await this.userService.getUser(user.id);
        return apps.map(a => Object.assign(a, { owner }));
    }

    async createApp({
        name,
        user,
    }: CreateAppDTO & { user: PicasscoReqUser }): Promise<
        PicasscoResponse & { app: AppEntity }
    > {
        const userAppsLength = await this.appRepository.count({
            owner: user.id,
        });
        if (userAppsLength > 8)
            throw new NotAcceptableException(
                "You reached your application limit",
            );
        const id = this.snowflake.next(),
            secret = uuidv4();
        const app = this.appRepository.create({
            id,
            name,
            owner: user.id,
            secret,
        });
        await this.appRepository.save(app);
        return { message: "Successfully Create Application", app };
    }

    async deleteApp({
        id,
        user,
    }: {
        id: number;
        user: PicasscoReqUser;
    }): Promise<PicasscoResponse> {
        const [isExist, app] = await this.isExistApplication(id, user.id);
        if (!isExist) throw new NotFoundException("Application Not Found");
        await this.appRepository.deleteOne(app);
        return { message: "Successfully Deleted Application" };
    }

    async patchApp(
        id: number,
        { name, description }: AppPatchDTO,
        user: PicasscoReqUser,
    ): Promise<PicasscoResponse> {
        const app = this.getApplication({ id, user });
        Object.assign(app, { name, description });
        await this.appRepository.updateOne({ id }, app);
        return Object.assign(
            { message: "Application updated successfully" },
            app,
        );
    }
}
