import { createClient } from "@libsql/client"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"
import { env } from "node:process"

config()

const client = createClient({
	authToken: env.TURSO_AUTH_TOKEN,
	url: env.TURSO_DB_URL!,
})

const database = drizzle(client)

migrate(database, { migrationsFolder: "drizzle" })
