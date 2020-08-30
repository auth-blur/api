import { Length } from "class-validator";

export abstract class AppPatchDTO {
    @Length(3, 32)
    name: string;

    @Length(0, 256)
    description: string;
}
