import { Injectable } from "@nestjs/common";

@Injectable()
export class PingService {
    ping(): { pong: boolean } {
        return { pong: true };
    }
}
