export enum UserFlag {
    ACTIVE_USER = 1 << 0,
    DEVELOPER = 1 << 1,
    SYSTEM = 1 << 2,
}
export enum AvatarFlag {
    PRO_USER = 1 << 0,
    CLIENT = 1 << 1,
}

export enum ClientFlag {
    NORMAL = 1 << 0,
    VERIFIED = 1 << 1,
    SYSTEM = 1 << 3,
}

export enum Type {
    USER = 1 << 0,
    AVATAR = 1 << 1,
    CLIENT = 1 << 2,
}
export type Flag = UserFlag | AvatarFlag | ClientFlag;

const Types = {
    USER: 1 << 0,
    AVATAR: 1 << 1,
    CLIENT: 1 << 2,
};

const Flags = {
    USER: {
        ACTIVE_USER: 1 << 0,
        DEVELOPER: 1 << 1,
        SYSTEM: 1 << 2,
    },
    AVATAR: {
        PRO_USER: 1 << 0,
        CLIENT: 1 << 1,
    },
    CLIENT: {
        NORMAL: 1 << 0,
        VERIFIED: 1 << 1,
        SYSTEM: 1 << 3,
    },
};

export interface ISnowflake {
    id: number;
    timestamp: number;
    flags: string[];
    count: number;
    type: string;
}

export class SnowFlakeFactory {
    private EPOCH = 1596963600000;
    private count = 0;
    private flag: Flag;
    private type: number;
    private typeName: string;

    constructor(iflags: Array<Flag>, itype: Type) {
        this.flag = iflags.reduce((acc, cur) => acc | cur);
        const [name, type] = Object.entries(Types).find(
            ([, val]) => val == itype,
        );
        this.type = type;
        this.typeName = name;
    }
    next(iflags?: Array<Flag>): number {
        this.count += 1;
        const BwUnixMs = (Date.now() - this.EPOCH).toString(2);
        let BwType = this.type.toString(2),
            BwWorker = (iflags
                ? iflags.reduce((acc, cur) => acc | cur)
                : this.flag
            ).toString(2),
            BwCount = (this.count & 0xfff).toString(2);

        while (BwCount.length < 12) {
            if (BwType.length < 5) BwType = "0" + BwType;
            if (BwWorker.length < 5) BwWorker = "0" + BwWorker;
            BwCount = "0" + BwCount;
        }
        const res = BwUnixMs + BwType + BwWorker + BwCount;
        return parseInt(res, 2);
    }

    serialization(id: number, type?: string): ISnowflake {
        const flags = Object.entries(Flags[type])
            .filter(f => f[1] == (id & 0x1f000) >> 12)
            .map(f => f[0]);
        return {
            id,
            timestamp: (id >> 22) + this.EPOCH,
            type,
            flags,
            count: id & 0xfff,
        };
    }
    static isSnowflake = (id: number): boolean => {
        const c = Math.log2(id);
        return c < 64 && c > 22;
    };
}
