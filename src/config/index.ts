import { TConfig } from "picassco"

export default ():TConfig => ({
    PORT: parseInt(process.env.PORT) || 3001,
    ROOT_PATH: process.env.ROOT_PATH || "/v1"
});