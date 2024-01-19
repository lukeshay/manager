import { userInfo } from "node:os"
import { env } from "node:process"

export const STAGE =
	!env.SST_STAGE || env.SST_STAGE === "preview"
		? userInfo().username
		: String(env.SST_STAGE)
