import { ValidateIf, Equals, IsFQDN } from "class-validator";
import { SnowFlakeFactory } from "src/libs/snowflake";

export abstract class AuthorizationDTO {
    @Equals("code")
    type: string;

    @ValidateIf(id => SnowFlakeFactory.isSnowflake(id))
    client_id: number;

    @ValidateIf(id => SnowFlakeFactory.isSnowflake(id))
    user_id: number;

    @IsFQDN()
    redirect_uri: string;

    scope: string;
}
