import { Injectable } from "@nestjs/common";
import { MongoRepository } from "typeorm";
import { AppEntity } from "./app.entity";

@Injectable()
export class AppService {
    constructor(
        private readonly clientRepository: MongoRepository<AppEntity>,
    ) {}
    async isExistApplication(id: number): Promise<[boolean, AppEntity]> {
        const ClientApp = await this.clientRepository.findOne({ id });
        let isExist = true;
        if (!ClientApp) isExist = false;
        return [isExist, ClientApp];
    }

    async validateApplication(ctx: {
        id: number;
        secret: string;
    }): Promise<[boolean, AppEntity]> {
        const ClientApp = await this.clientRepository.findOne(ctx);
        let isValid = true;
        if (!ClientApp) isValid = false;
        return [isValid, ClientApp];
    }
}
