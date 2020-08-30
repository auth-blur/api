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

@Entity({ name: "User" })
export class UserEntity {
    @PrimaryColumn({ unique: true })
    id: number;

    @Exclude()
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({ nullable: false, unique: true })
    username: string;

    @Exclude()
    @Column({ nullable: false, unique: true })
    mail: string;

    @Exclude()
    @Column({ nullable: false })
    password: string;

    @Column()
    description: string;

    @Column({ default: false })
    pro: boolean;

    @Column()
    avatar: number;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: number;

    @UpdateDateColumn({ type: "timestamp" })
    updateAt: number;

    @Exclude()
    @Column({ default: false })
    verified: boolean;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}
