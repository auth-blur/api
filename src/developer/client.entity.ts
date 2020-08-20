import {
    Entity,
    PrimaryColumn,
    ObjectIdColumn,
    ObjectID,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Exclude } from "class-transformer";

@Entity({ schema: "Client" })
export class ClientEntity {
    @PrimaryColumn({ unique: true })
    id: number;

    @Exclude()
    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    avatar: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ nullable: false, unique: true })
    secret: string;

    @Column({ nullable: false })
    ownerID: number;

    @Column()
    redirects: string[];

    @CreateDateColumn({ type: "timestamp" })
    createdAt: number;

    @UpdateDateColumn({ type: "timestamp" })
    updateAt: number;
}
