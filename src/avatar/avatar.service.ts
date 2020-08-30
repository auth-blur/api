import {
    Injectable,
    NotFoundException,
    Logger,
    InternalServerErrorException,
    NotAcceptableException,
} from "@nestjs/common";
import { SnowflakeService, Type, AvatarFlag } from "@app/snowflake";
import { PicasscoReqUser, PicasscoResponse } from "picassco";
import * as firebase from "firebase";
import "@firebase/storage";
import { ConfigService } from "@nestjs/config";
import { GetAvatarDto } from "./dto/get-avatar.dto";
import { UserService } from "src/user/user.service";
import got from "got";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/user/user.entity";
import { MongoRepository } from "typeorm";
import * as sharp from "sharp";

@Injectable()
export class AvatarService {
    private readonly FirebaseInstance = firebase.initializeApp(
        this.configService.get("Firebase"),
    );
    private readonly StorageInstance = this.FirebaseInstance.storage();
    private readonly FirebaseStorage = this.StorageInstance.ref();

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: MongoRepository<UserEntity>,
        private readonly userService: UserService,
        private readonly snowflake: SnowflakeService,
        private readonly configService: ConfigService,
    ) {
        this.snowflake.setType(Type.AVATAR);
    }

    qualityCheck(
        user: PicasscoReqUser,
    ): { avatarLimit: number; quality: number } {
        let avatarLimit, quality;
        user.SID.flags.forEach(f => {
            switch (f) {
                case "USER":
                    avatarLimit = 5;
                    quality = 70;
                case "PRO_USER":
                    avatarLimit = 25;
                    quality = 100;
                case "PARTNER":
                    avatarLimit = 30;
                    quality = 100;
                case "DEVELOPER":
                    avatarLimit = 999;
                    quality = 100;
                    break;
                case "SYSTEM":
                    avatarLimit = 999;
                    quality;
                    break;
            }
        });
        return { avatarLimit, quality };
    }

    async uploadUser(
        file: { [prop: string]: any },
        user: PicasscoReqUser,
    ): Promise<PicasscoResponse> {
        const userAvatars = await this.getAll(user.id);
        const { avatarLimit, quality } = this.qualityCheck(user);
        if (userAvatars.length >= avatarLimit)
            throw new NotAcceptableException("You reached your avatar limit");

        const avatar = file.buffer,
            avatarID = this.snowflake.next([0]);

        const AvatarRef = this.FirebaseStorage.child(
            `${user.id}/${avatarID}.webp`,
        );
        await this.userRepository.findOneAndUpdate(
            { id: user.id },
            { avatar: avatarID },
        );
        const buff = await sharp(avatar)
            .resize(1024, 1024)
            .webp({ quality })
            .toBuffer();
        await AvatarRef.put(buff, { contentType: "image/webp" });
        return {
            message: "Successfully Uploaded User Avatar",
            avatar: avatarID,
        };
    }

    async uploadApp({
        user,
        app,
        file,
    }: {
        user: PicasscoReqUser;
        app: any;
        file: any;
    }): Promise<PicasscoResponse> {
        if (user.id != app.owner.id)
            throw new NotFoundException("App Not Found");
        if (app.avatar) await this.delete(app.id, app.avatar);
        const avatar = file.buffer,
            avatarID = this.snowflake.next([AvatarFlag.APPLICATION]);
        const AvatarRef = this.FirebaseStorage.child(
            `${app.id}/${avatarID}.webp`,
        );
        const buff = await sharp(avatar)
            .resize(512, 512)
            .webp({ quality: 70 })
            .toBuffer();
        await AvatarRef.put(buff, { contentType: "image/webp" });
        return {
            message: "Successfully Uploaded Application Avatar",
            avatar: avatarID,
        };
    }

    async getAll(id: number): Promise<string[]> {
        const AvatarRef = this.FirebaseStorage.child(id.toString());
        try {
            const avatars = await AvatarRef.listAll();
            return avatars.items.map(data => data.fullPath);
        } catch (e) {
            return [];
        }
    }

    async get({ userID, avatarID,size }: GetAvatarDto&{size?:number}): Promise<Buffer> {
        let AvatarRef = this.FirebaseStorage.child("default.png");
        if (!avatarID) {
            const user = await this.userService.getUser(userID);
            if (!user) throw new NotFoundException("User Not Found");
            if (user && user.avatar)
                AvatarRef = this.FirebaseStorage.child(
                    `${userID}/${user.avatar}.webp`,
                );
        } else
            AvatarRef = this.FirebaseStorage.child(
                `${userID}/${avatarID}.webp`,
            );
        try {
            const AvatarURI = await AvatarRef.getDownloadURL();
            const avatarBuff = (await got(AvatarURI)).rawBody;
            if(size&& (16 < size && size<1024))
                return sharp(avatarBuff)
                .resize(size,size)
                .toBuffer()
            else return avatarBuff;
        } catch (e) {
            Logger.log("Get Avatar", e);
            throw new NotFoundException("Avatar Not Found");
        }
    }

    async delete(userID: number, avatarID: number): Promise<PicasscoResponse> {
        const AvatarRef = this.FirebaseStorage.child(
            `${userID}/${avatarID}.webp`,
        );
        try {
            await AvatarRef.delete();
            return { message: "Successfully Deleted Avatar" };
        } catch (e) {
            throw new NotFoundException("Avatar Not Found");
        }
    }

    async deleteAll(user: PicasscoReqUser): Promise<PicasscoResponse> {
        const UserRef = this.FirebaseStorage.child(user.id.toString());
        const itemRefs = (await UserRef.listAll()).items;
        try {
            await itemRefs.forEach(async ref => await ref.delete());
            return { message: "Successfully Removed All Avatars" };
        } catch (e) {
            Logger.log("Delete Avatar", e);
            throw new InternalServerErrorException(
                "Storage Error. Please Contact to Support Team",
            );
        }
    }
}
