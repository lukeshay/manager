import type { Config } from "drizzle-kit"

import { config } from "dotenv"
import { env } from "node:process"

config()

export default {
	dbCredentials: {
		authToken: env.TURSO_AUTH_TOKEN,
		url: env.TURSO_DB_URL!,
	},
	driver: "turso",
	out: "./drizzle",
	schema: "./src/schema.ts",
} satisfies Config
