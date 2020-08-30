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

@Entity({ name: "Application" })
export class AppEntity {
    @PrimaryColumn({ unique: true })
    id: number;

    @Exclude()
    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    avatar: number;

    @Column({ nullable: false })
    name: string;

    @Column()
    description: string;

    @Exclude()
    @Column({ nullable: false, unique: true })
    secret: string;

    @Column({ nullable: false })
    owner: number;

    @Exclude()
    @Column()
    redirects: string[];

    @CreateDateColumn({ type: "timestamp" })
    createdAt: number;

    @UpdateDateColumn({ type: "timestamp" })
    updateAt: number;

    constructor(partial: Partial<AppEntity>) {
        Object.assign(this, partial);
    }
}
