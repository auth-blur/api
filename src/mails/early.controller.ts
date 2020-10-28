import { Body, Controller, Post } from "@nestjs/common";
import { RateLimit } from "nestjs-rate-limit";
import { PicasscoResponse } from "picassco";
import { PostEarlyDto } from "./dto/post-early.dto";
import { MailService } from "./mail.service";

@Controller("early")
export class EarlyController {
    constructor(private mailService: MailService) {}

    @Post("mail")
    @RateLimit({ points: 3, duration: 3 * 60 * 60 })
    @RateLimit({ points: 15, duration: 24 * 60 * 60 })
    async postEarlyList(
        @Body() { mail }: PostEarlyDto,
    ): Promise<PicasscoResponse> {
        return await this.mailService.postEarlyList(mail);
    }
}
