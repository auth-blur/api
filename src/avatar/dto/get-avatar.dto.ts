import { IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import { IsSnowflake } from "src/oauth/snowflake.decorator";

export abstract class GetAvatarDto {
    
    @IsSnowflake()
    @Transform(v => parseInt(v))
    @IsOptional()
    avatarID?: number;
    
    @IsSnowflake()
    @Transform(v => parseInt(v))
    @IsOptional()
    userID?: number;
}
