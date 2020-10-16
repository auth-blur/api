import { IsEmail } from "class-validator";

export abstract class PostEarlyDto {
    @IsEmail()
    mail: string;
}
