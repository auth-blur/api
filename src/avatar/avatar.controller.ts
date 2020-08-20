import { Controller } from "@nestjs/common";
import { AvatarService } from "./avatar.service";

@Controller("/avatars")
export class AvatarController {
    constructor(private readonly avatarService: AvatarService) {}
}
