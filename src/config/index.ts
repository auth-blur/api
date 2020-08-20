import { TConfig } from "picassco"

export default ():TConfig => ({
    port: parseInt(process.env.PORT) || 3001,
    rootPath: process.env.ROOT_PATH || "/v1"
})