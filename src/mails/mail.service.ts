import { BadRequestException, Injectable } from "@nestjs/common";
import { PicasscoResponse } from "picassco";
import { InjectRepository } from "@nestjs/typeorm";
import { EarlyMailEntity } from "./early-mail.entity";
import { MongoRepository } from "typeorm";

@Injectable()
export class MailService {
    constructor(
        @InjectRepository(EarlyMailEntity)
        private readonly earlyMailEntity: MongoRepository<EarlyMailEntity>
    ) {}
    
    async isExistEarlyList(address: string):Promise<boolean> {
        return await this.earlyMailEntity.count({ mail: address }) > 0
    }

    async postEarlyList(address:string):Promise<PicasscoResponse> {
        if(await this.isExistEarlyList(address))
            throw new BadRequestException({},"This mail is already registered")
            
        const mailEntity = this.earlyMailEntity.create({
            mail: address
        })
        await this.earlyMailEntity.save(mailEntity)
        return {
            message: "Successfully joined the Early Access"
        }
    }
}
