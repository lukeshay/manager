import { userInfo } from "node:os"
import { env } from "node:process"

export const STAGE =
	env.AWS_PROFILE === "preview" ? userInfo().username : String(env.AWS_PROFILE)
