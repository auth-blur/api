import { SetMetadata } from "@nestjs/common";
import { Flag } from "@app/snowflake";

export const Flags = (...flags: Flag[]): any =>
    SetMetadata(
        "flags",
        flags.reduce((acc, cur) => acc | cur),
    );
