import { Controller, Get } from "@nestjs/common";
import {
    DNSHealthIndicator,
    HealthCheck,
    HealthCheckResult,
    HealthCheckService,
    HealthIndicatorResult,
} from "@nestjs/terminus";

@Controller("health")
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly dns: DNSHealthIndicator,
    ) {}

    @Get()
    @HealthCheck()
    check(): Promise<HealthCheckResult> {
        return this.health.check([
            (): Promise<HealthIndicatorResult> =>
                this.dns.pingCheck("google", "https://google.com"),
        ]);
    }

    @Get("/hello")
    helloWorld(): string {
        return "Hello World";
    }
}
