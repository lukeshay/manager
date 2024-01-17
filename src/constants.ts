import { userInfo } from "node:os"
import { env } from "node:process"

export const STAGE =
	!env.STAGE || env.STAGE === "preview"
		? userInfo().username
		: String(env.STAGE)
