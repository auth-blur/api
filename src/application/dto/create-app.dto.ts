import { Length } from "class-validator";

export abstract class CreateAppDTO {
    @Length(3, 32)
    name: string;
}
