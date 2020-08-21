import { Length, IsEmail } from "class-validator";

export abstract class SigninDTO {
    @IsEmail()
    mail: string;

    @Length(6, 32)
    password: string;
}
