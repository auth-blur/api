import { Length, IsAlphanumeric } from "class-validator";

export abstract class CreateAppDTO {
    @Length(3, 32)
    @IsAlphanumeric()
    name: string;
}
