import { z } from "zod"

export const ServerEnvironment = z.object({
	COGNITO_CLIENT_ID: z.string().min(1),
	COGNITO_CLIENT_SECRET: z.string(),
	COGNITO_ISSUER: z.string().min(1),
	STAGE: z.string().min(1),
	WEB_DATA_TABLE_NAME: z.string().min(1),
})

export type ServerEnvironment = z.infer<typeof ServerEnvironment>

export const serverEnvironment = ServerEnvironment.parse(process.env)
