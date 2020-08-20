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
import { PicasscoResponse } from "picassco";
import { SnowFlakeFactory, UserFlag, Type } from "../libs/snowflake";
import { OAuthService } from "../oauth/oauth.service";
import * as argon2 from "argon2";

@Injectable()
export class UserService {
    private readonly snowflake = new SnowFlakeFactory(
        [UserFlag.ACTIVE_USER],
        Type.USER,
    );

    constructor(
        @InjectRepository(UserEntity)
        private userRepository: MongoRepository<UserEntity>,
        @Inject(forwardRef(() => OAuthService))
        private readonly oauthService: OAuthService,
    ) {}

    async getMeData(id:number):Promise<UserEntity> {
        const user = await this.userRepository.findOne({id})
        if(!user) throw new NotFoundException("User Not Found")
        return user
    }

    async createUser({
        mail,
        username,
        password,
    }: SignupDTO): Promise<PicasscoResponse> {
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
        await this.userRepository.create({ id, username, mail, password });
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
