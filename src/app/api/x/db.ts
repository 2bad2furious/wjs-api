import {pgTable, text, uuid, date, time, timestamp} from "drizzle-orm/pg-core";
import {drizzle} from "drizzle-orm/postgres-js";
import {env} from "@/env.mjs";
import postgres from "postgres";
import * as timers from "timers";

export const users = pgTable('x_users', {
    id: uuid('id').defaultRandom().primaryKey(),
    authToken: text("token"),
    fullName: text('full_name'),
});

export const publicUserColumns = {
    id: users.id,
    fullName: users.fullName
} as const;

export const posts = pgTable("x_posts", {
    id: uuid("id").defaultRandom().primaryKey(),
    authorId: uuid("authorId"),
    content: text("content"),
    createdAt: timestamp("createdAt", {withTimezone: true}).defaultNow()
})

const client = postgres(env.DATABASE_URL)

export const db = drizzle(client);