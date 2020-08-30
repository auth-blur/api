import {
    registerDecorator,
    ValidationOptions,
} from "class-validator";
import { SnowflakeService } from "@app/snowflake";

export function IsSnowflake(options?: ValidationOptions) {
    return (object: unknown, propertyName: string): void => {
        registerDecorator({
            name: "isSnowflake",
            target: object.constructor,
            propertyName,
            options,
            validator: {
                validate(value: any) {
                    if (typeof value === "number")
                        return SnowflakeService.isSnowflake(value);
                    else return false;
                },
            },
        });
    };
}
