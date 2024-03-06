import {db, posts, postsLikes, publicPostColumns, publicUserColumns, users} from "../db";
import {and, count, desc, eq, ilike, or} from "drizzle-orm";
import {SQL} from "drizzle-orm/sql/sql";
import {alias} from "drizzle-orm/pg-core";

export async function getPostById(id: string) {
    const results = await db.select({
        post: publicPostColumns,
        author: publicUserColumns,
        likeCount: count(postsLikes.id)
    } as const).from(posts)
        .innerJoin(users, eq(users.id, posts.authorId))
        .leftJoin(postsLikes, eq(postsLikes.postId, posts.id))
        .where(and(eq(posts.id, id)))
            .groupBy(posts.id)
        ;

    if (!results.length) {
        return null
    }

    return results[0];
}
export async function getPostByIdWithToken (id: string) {
    const userColumns = {
        ...publicUserColumns,
        authToken: users.authToken
    }

    const results = await db.select({
        post: publicPostColumns,
        author: userColumns
    } as const).from(posts)
        .innerJoin(users, eq(users.id, posts.authorId))
        .where(and(eq(posts.id, id)))
        .limit(1);

    if (!results.length) {
        return null
    }

    return results[0];
}

export async function getPostWithLikesAndLikeStatus(id: string, userId: string){
    const userLikes = alias(postsLikes, "userLikes");

    const results = await db.select({
        post: publicPostColumns,
        author: publicUserColumns,
        likeStatus: userLikes,
        likeCount: count(postsLikes)
    } as const).from(posts)
        .innerJoin(users, eq(users.id, posts.authorId))
        .leftJoin(userLikes, and(
            eq(userLikes.postId, posts.id),
            eq(userLikes.authorId, userId))
        )
        .leftJoin(postsLikes, eq(postsLikes.postId, posts.id))
        .where(and(eq(posts.id, id)))
        .groupBy(posts.id, publicUserColumns.id, userLikes.id);

    if (!results.length) {
        return null
    }

    return results[0];
}

export async function getPostWithLikeStatus(id: string, userId: string){
    const results = await db.select({
        post: publicPostColumns,
        author: publicUserColumns,
        likeStatus: postsLikes
    } as const).from(posts)
        .innerJoin(users, eq(users.id, posts.authorId))
        .leftJoin(postsLikes, and(
            eq(postsLikes.postId, posts.id),
            eq(postsLikes.authorId, userId))
        )
        .where(and(eq(posts.id, id)))
        .limit(1);

    if (!results.length) {
        return null
    }

    return results[0];
}

export async function getUserByAccessToken(access: string){
    return (await db.select({authorId: users.id})
        .from(users)
        .where(eq(users.authToken, access))
        .limit(1))[0];
}

export async function getAllPosts({userId, currentUserId, search, noLimit}: { userId: string |null, currentUserId: string, search: string | null, noLimit?: boolean}){

    const conditions: (SQL | undefined)[] = [];
    if (search) {
        conditions.push(or(
            ilike(posts.content, "%" + (search) + "%"),
            ilike(users.fullName, "%" + (search) + "%")
        ))
    }
    if (userId) {
        conditions.push(eq(users.id, userId))
    }

    const postsQuery = db.select({id: posts.id})
        .from(posts)
        .innerJoin(users, eq(users.id, posts.authorId))
        .where(and(...conditions))
        .orderBy(desc(posts.createdAt))
        .limit(noLimit ?  Number.MAX_SAFE_INTEGER : 30)
        .as("pp");

    const userLikes = alias(postsLikes, "userPostLikes")

    return await db.select({
        post: publicPostColumns,
        author: publicUserColumns,
        likeCount: count(postsLikes.id),
        likeStatus: userLikes.id
    }).from(posts)
        .innerJoin(postsQuery, eq(postsQuery.id, posts.id))
        .innerJoin(users, eq(users.id, posts.authorId))
        .leftJoin(postsLikes, eq(postsLikes.postId, posts.id))
        .leftJoin(userLikes, and(eq(userLikes.postId, posts.id), eq(userLikes.authorId, currentUserId)))
        .groupBy(posts.id, publicUserColumns.id, userLikes.id)
        .orderBy(desc(posts.createdAt));
}