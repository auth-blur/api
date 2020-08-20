import { ValidateIf, Equals, IsFQDN } from "class-validator";
import { isSnowflake } from "src/libs/snowflake";

export abstract class AuthorizationDTO {
    @Equals("code")
    type: string;

    @ValidateIf(id => isSnowflake(id))
    client_id: number;

    @ValidateIf(id => isSnowflake(id))
    user_id: number;

    @IsFQDN()
    redirect_uri: string;

    scope: string;
}
