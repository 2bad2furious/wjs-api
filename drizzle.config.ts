import {defineConfig} from 'drizzle-kit'
import {env} from "@/env.mjs";

export default defineConfig({
    schema: "./src/app/api/x/db.ts",
    driver: 'pg',
    dbCredentials: {
        connectionString: env.DATABASE_URL,
    },
    verbose: true,
    strict: true,
    out: "./drizzle"
})