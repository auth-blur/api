import {
    Injectable,
    ConflictException,
    HttpException,
    HttpStatus,
    Inject,
    forwardRef,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { AppEntity } from "src/application/app.entity";
import { SignupDTO } from "../auth/dto/signup.dto";
import { MongoRepository } from "typeorm";
import { SnowflakeService, UserFlag, Type } from "@app/snowflake";
import { OAuthService } from "../oauth/oauth.service";
import { AvatarService } from "../avatar/avatar.service";
import * as argon2 from "argon2";
import { plainToClass } from "class-transformer";
import { PicasscoResponse, PicasscoReqUser } from "picassco";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: MongoRepository<UserEntity>,
        @InjectRepository(AppEntity)
        private readonly appRepository: MongoRepository<AppEntity>,
        @Inject(forwardRef(() => OAuthService))
        private readonly oauthService: OAuthService,
        private readonly snowflake: SnowflakeService,
        @Inject(forwardRef(() => AvatarService))
        private readonly avatarService: AvatarService,
    ) {}

    async getUser(id: number): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ id });
        if (!user) throw new NotFoundException("User Not Found");
        return Object.assign(plainToClass(UserEntity, user), {
            flags: (id & 0x1f000) >> 12,
        });
    }

    async getMyData(id: number, scopes?: number): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ id });
        if (!user) throw new NotFoundException("User Not Found");
        return Object.assign(plainToClass(UserEntity, user), {
            mail:
                (scopes & 2) === 2 || (scopes & 32) === 32
                    ? user.mail
                    : undefined,
            flags: (id & 0x1f000) >> 12,
        });
    }

    async isExist(id: number): Promise<boolean> {
        const users = await this.userRepository.count({ id });
        return users === 1;
    }

    async createUser({
        mail,
        username,
        password,
    }: SignupDTO): Promise<{ access_token: string; expiresIn: number }> {
        this.snowflake.setType(Type.USER);
        this.snowflake.setFlags([UserFlag.ACTIVE_USER]);
        const isUnique = await this.isUnique({ mail, username });
        if (!isUnique)
            throw new ConflictException(
                "This mail or username is already registered",
            );
        const id = this.snowflake.next();
        const { access_token, expiresIn } = this.oauthService.genToken({
            id,
            scope: this.oauthService.Scopes.root,
        });
        const hash = await argon2.hash(password);
        const user = await this.userRepository.create({
            id,
            username,
            mail,
            password: hash,
        });
        await this.userRepository.save(user);
        return { access_token, expiresIn };
    }
    async isUnique({ username, mail }): Promise<boolean> {
        const matchUsers = await this.userRepository.find({
            username,
            mail,
        });
        return matchUsers.length == 0;
    }
    async isCorrectPassword(
        mail: string,
        password: string,
    ): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ mail });
        if (!user)
            throw new HttpException(
                "Incorrect password or mail (0)",
                HttpStatus.BAD_REQUEST,
            );
        const verify = await argon2.verify(user.password, password);
        if (!verify)
            throw new HttpException(
                "Incorrect password or mail (1)",
                HttpStatus.BAD_REQUEST,
            );
        return user;
    }
    async patchUser(
        { username, mail, password, new_password },
        user: PicasscoReqUser,
    ): Promise<PicasscoResponse> {
        let u = await this.getUser(user.id);
        u = await this.isCorrectPassword(u.mail, password);
        const uUser = {};
        if (username && username != u.username) {
            const isUnique = await this.isUnique({ username, mail });
            if (!isUnique)
                throw new ConflictException(
                    "This username is already registered",
                );
            uUser["username"] = username;
        }
        if (mail && mail != u.mail) {
            const isUnique = await this.isUnique({ username, mail });
            if (!isUnique)
                throw new ConflictException("This mail is already registered");
            uUser["mail"] = mail;
        }
        if (new_password) {
            if (new_password === password)
                throw new ConflictException("Must have a new password");
            uUser["password"] = new_password;
        }
        const newUser = await this.userRepository.findOneAndUpdate(
            { id: user.id },
            uUser,
        );
        const { access_token, expiresIn } = this.oauthService.genToken({
            id: user.id,
            scope: this.oauthService.Scopes.root,
        });
        return {
            message: "Successfully edited",
            newUser,
            access_token,
            expiresIn,
        };
    }

    async deleteUser(id: number): Promise<PicasscoResponse> {
        const isExists = this.isExist(id);
        if (!isExists) throw new NotFoundException("User not found");
        await this.appRepository.deleteMany({ owner: id });
        this.avatarService.deleteAll(id);
        await this.userRepository.deleteMany({ id });
        return { message: "Account deleted successfully" };
    }
}
