import { z } from "zod"

export const ServerEnvironment = z.object({
	WEB_DATA_TABLE_NAME: z.string(),
})

export type ServerEnvironment = z.infer<typeof ServerEnvironment>

export const serverEnvironment = ServerEnvironment.parse(process.env)
