import { Length } from "class-validator";

export abstract class CreateAppDTO {
    @Length(3, 10)
    name: string;
}
