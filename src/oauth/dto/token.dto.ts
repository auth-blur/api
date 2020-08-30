import {
    ValidateIf,
    IsUUID,
    IsFQDN,
    Length,
    IsEmail,
    IsOptional,
} from "class-validator";
import { IsSnowflake } from "../snowflake.decorator";

export abstract class TokenDTO {
    @IsSnowflake()
    client_id: number;

    @IsUUID("4")
    client_secret: string;

    @ValidateIf(g =>
        ["authorization_code", "password", "refresh_token"].includes(g),
    )
    grant_type: "authorization_code" | "password" | "refresh_token";

    @IsOptional()
    @IsUUID("4")
    code?: string;

    @IsOptional()
    @IsFQDN()
    redirect_uri?: string;

    @IsOptional()
    @IsEmail()
    username?: string;

    @IsOptional()
    @IsEmail()
    mail?: string;

    @IsOptional()
    @Length(6, 32)
    password?: string;
}
