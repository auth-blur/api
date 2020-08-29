import { ValidateIf, Equals, IsFQDN } from "class-validator";
import { SnowflakeService } from "@app/snowflake";

export abstract class AuthorizationDTO {
    @Equals("code")
    type: string;

    @ValidateIf(id => SnowflakeService.isSnowflake(id))
    client_id: number;

    @ValidateIf(id => SnowflakeService.isSnowflake(id))
    user_id: number;

    @IsFQDN()
    redirect_uri: string;

    scope: string;
}
