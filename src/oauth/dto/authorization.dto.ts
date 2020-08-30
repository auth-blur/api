import { Equals, IsFQDN } from "class-validator";
import { IsSnowflake } from "../snowflake.decorator";

export abstract class AuthorizationDTO {
    @Equals("code")
    type: string;

    @IsSnowflake()
    client_id: number;

    @IsSnowflake()
    user_id: number;

    @IsFQDN()
    redirect_uri: string;

    scope: string;
}
