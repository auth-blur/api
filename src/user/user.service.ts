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
import { SignupDTO } from "../auth/dto/signup.dto";
import { MongoRepository } from "typeorm";
import { SnowFlakeFactory, UserFlag, Type } from "../libs/snowflake";
import { OAuthService } from "../oauth/oauth.service";
import * as argon2 from "argon2";
import { plainToClass } from "class-transformer";

@Injectable()
export class UserService {
    private readonly snowflake = new SnowFlakeFactory(
        [UserFlag.ACTIVE_USER],
        Type.USER,
    );

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: MongoRepository<UserEntity>,
        @Inject(forwardRef(() => OAuthService))
        private readonly oauthService: OAuthService,
    ) {}

    async getUser(id: number): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ id });
        if (!user) throw new NotFoundException("User Not Found");
        return Object.assign(plainToClass(UserEntity, user), {
            flags: (id & 0x1f000) >> 12,
        });
    }

    async getMyData(id: number): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ id });
        if (!user) throw new NotFoundException("User Not Found");
        return Object.assign(plainToClass(UserEntity, user), {
            mail: user.mail,
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
        const matchUsers = await this.userRepository.count({
            where: [{ username }, { mail }],
        });
        return matchUsers === 0;
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
}
