import { IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export abstract class GetAvatarDto {
    @Transform(v => parseInt(v))
    @IsOptional()
    avatarID?: number;
    @Transform(v => parseInt(v))
    @IsOptional()
    userID?: number;
}
