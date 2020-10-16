import {
    CreateDateColumn,
    Entity,
    ObjectID,
    ObjectIdColumn,
    PrimaryColumn
} from "typeorm";

@Entity({ name: "Early" })
export class EarlyMailEntity {

    @PrimaryColumn({type: "string", unique: true})
    mail: string

    @ObjectIdColumn()
    _id: ObjectID
    

    @CreateDateColumn({ type: "timestamp" })
    createdAt: number
}
