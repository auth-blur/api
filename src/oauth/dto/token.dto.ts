import {
    ValidateIf,
    Equals,
    IsUUID,
    IsFQDN,
    Length,
    IsEmail,
} from "class-validator";
import { isSnowflake } from "src/libs/snowflake";

export abstract class TokenDTO {
    @ValidateIf(id => isSnowflake(id))
    client_id: number;

    @IsUUID("4")
    client_secret: string;

    @Equals(["authorization_code", "password"])
    grant_type: string;

    @IsUUID("4")
    code?: string;

    @IsFQDN()
    redirect_uri?: string;

    @IsEmail()
    mail?: string;

    @Length(6, 32)
    password?: string;
}
