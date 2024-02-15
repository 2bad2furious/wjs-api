import {checkAccess} from "@/app/api/countries/checkAccess";
import {db, posts, publicUserColumns, users} from "@/app/api/x/db";
import {and, desc, eq, ilike, or,} from "drizzle-orm";
import {z} from "zod";
import {SQL} from "drizzle-orm/sql/sql";

const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization"
});

export function OPTIONS() {
    return Response.json({}, {headers})
}

export async function GET(request: Request) {
    const access = checkAccess(request);
    if (access instanceof Response) {
        return access;
    }

    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const userId = url.searchParams.get("userId");

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

    const result = await db.select({
        post: {
            id: posts.id,
            content: posts.content,
            createdAt: posts.createdAt,
        },
        author: publicUserColumns
    }).from(posts)
        .innerJoin(users, eq(users.id, posts.authorId))
        .where(and(...conditions))
        .orderBy(desc(posts.createdAt))
        .limit(30);

    return Response.json({data: result}, {headers})
}

const schema = z.object({
    content: z.string()
        .min(5, "Enter at least 5 characters")
        .max(250, "Enter at most 250 characters")
})

export async function POST(request: Request) {
    const access = checkAccess(request);
    if (access instanceof Response) {
        return access;
    }

    const rawData = await request.json();
    const parseResult = await schema.safeParseAsync(rawData);
    if (!parseResult.success) {
        return Response.json({message: "Invalid data", errors: parseResult.error.flatten()}, {status: 400, headers});
    }

    const {authorId} = (await db.select({authorId: users.id})
        .from(users)
        .where(eq(users.authToken, access))
        .limit(1))[0];

    const {content} = parseResult.data;
    const inserted = await db.insert(posts).values({authorId, content}).returning();

    return Response.json({data: inserted}, {headers})
}