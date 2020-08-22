import { Length, IsEmail } from "class-validator";

export abstract class UserPatchDTO {
    @Length(3, 32)
    username: string;

    @IsEmail()
    mail: string;

    @Length(6, 32)
    password: string;

    @Length(6, 32)
    new_password: string;
}
