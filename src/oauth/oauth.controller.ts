import { Controller, Body, Post } from "@nestjs/common";
import { OAuthService } from "./oauth.service";
import { PicasscoResponse } from "picassco";
import { AuthorizationDTO } from "./dto/authorization.dto";
import { TokenDTO } from "./dto/token.dto";

@Controller("/oauth2")
export class OAuthController {
    constructor(private readonly oauthService: OAuthService) {}

    @Post("/authorize")
    async authorize(@Body() authorizeBody:AuthorizationDTO):Promise<PicasscoResponse> {
        return await this.oauthService.authorization(authorizeBody)
    }

    @Post("/token")
    async getToken(@Body() tokenBody: TokenDTO): Promise<PicasscoResponse> {
        return await this.oauthService.getToken(tokenBody)
    }
}
