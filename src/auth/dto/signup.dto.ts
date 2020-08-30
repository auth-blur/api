import { Length, IsEmail, IsAlphanumeric } from "class-validator";

export abstract class SignupDTO {
    @Length(3, 32)
    @IsAlphanumeric()
    username: string;

    @IsEmail()
    mail: string;

    @Length(6, 32)
    password: string;
}
