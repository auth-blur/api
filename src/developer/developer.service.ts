import { Injectable } from "@nestjs/common";
import { MongoRepository } from "typeorm";
import { ClientEntity } from "./client.entity";

@Injectable()
export class DeveloperService {
    constructor(
        private readonly clientRepository: MongoRepository<ClientEntity>,
    ) {}
    async isExistApplication(id: number): Promise<[boolean, ClientEntity]> {
        const ClientApp = await this.clientRepository.findOne({ id });
        let isExist = true;
        if (!ClientApp) isExist = false;
        return [isExist, ClientApp];
    }

    async validateApplication(ctx: {
        id: number;
        secret: string;
    }): Promise<[boolean, ClientEntity]> {
        const ClientApp = await this.clientRepository.findOne(ctx);
        let isValid = true;
        if (!ClientApp) isValid = false;
        return [isValid, ClientApp];
    }
}
