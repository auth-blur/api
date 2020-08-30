import { Length, IsEmail, IsAlphanumeric } from "class-validator";

export abstract class UserPatchDTO {
    @Length(3, 32)
    @IsAlphanumeric()
    username: string;

    @IsEmail()
    mail: string;

    @Length(6, 32)
    password: string;

    @Length(6, 32)
    new_password: string;
}
