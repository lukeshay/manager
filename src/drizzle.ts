import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import { serverEnvironment } from "./server-environment"

const client = createClient({
	authToken: serverEnvironment.TURSO_AUTH_TOKEN,
	url: serverEnvironment.TURSO_DB_URL,
})

export const database = drizzle(client)
