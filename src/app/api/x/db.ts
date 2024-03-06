import {pgTable, text, timestamp, unique,} from "drizzle-orm/pg-core";
import {drizzle} from "drizzle-orm/postgres-js";
import {env} from "@/env.mjs";
import postgres from "postgres";
import {randomUUID} from "node:crypto";

export const users = pgTable('x_users', {
    id: text('id').$default(randomUUID).primaryKey(),
    authToken: text("token").unique().notNull(),
    fullName: text('full_name').notNull(),
});

export const publicUserColumns = {
    id: users.id,
    fullName: users.fullName
} as const;

export const posts = pgTable("x_posts", {
    id: text("id").$default(randomUUID).primaryKey(),
    authorId: text("authorId").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("createdAt", {withTimezone: true}).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", {withTimezone: true}).defaultNow().notNull(),
})

export const publicPostColumns = {
    id: posts.id,
    content: posts.content,
    createdAt: posts.createdAt,
} as const;

export const postsLikes = pgTable("x_post_likes", {
    id: text("id").$default(randomUUID).primaryKey(),
    authorId: text("authorId").notNull(),
    postId: text("postId").notNull(),
    createdAt: timestamp("createdAt", {withTimezone: true}).defaultNow().notNull(),
}, v => ({
    unq: unique("author-post").on(v.authorId,v.postId)
}))

const client = postgres(env.DATABASE_URL)

export const db = drizzle(client,{ logger: true});