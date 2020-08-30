import { SetMetadata } from "@nestjs/common";
import { Scope } from "./oauth.service";

export const Scopes = (...scopes: Scope[]): any =>
    SetMetadata(
        "scope",
        scopes.reduce((acc, cur) => acc | cur),
    );
