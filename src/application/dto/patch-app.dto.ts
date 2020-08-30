import { Length, IsAlphanumeric } from "class-validator";

export abstract class AppPatchDTO {
    @Length(3, 32)
    @IsAlphanumeric()
    name: string;

    @Length(0, 256)
    description: string;
}
