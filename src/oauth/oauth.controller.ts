import { Controller } from "@nestjs/common";
import { OAuthService } from "./oauth.service";

@Controller("/oauth")
export class OAuthController {
    constructor(private readonly oauthService: OAuthService) {}
}
