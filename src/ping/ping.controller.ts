import { Controller, Get } from "@nestjs/common";
import { PingService } from "./ping.service";

@Controller("/ping")
export class PingController {
    constructor(private readonly pingService: PingService) {}

    @Get("/")
    ping(): { pong: boolean } {
        return this.pingService.ping();
    }
}
