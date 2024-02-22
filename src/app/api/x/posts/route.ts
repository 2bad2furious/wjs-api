import {checkAccess} from "@/app/api/countries/checkAccess";
import {db, posts, publicPostColumns, publicUserColumns, users} from "@/app/api/x/db";
import {and, desc, eq, ilike, or,} from "drizzle-orm";
import {SQL} from "drizzle-orm/sql/sql";
import {schema} from "./schema";
import {validationFailed} from "@/app/api/x/utils";

const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization,content-type"
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
    const noLimit = url.searchParams.get("noLimit") !== null;

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
        post: publicPostColumns,
        author: publicUserColumns
    }).from(posts)
        .innerJoin(users, eq(users.id, posts.authorId))
        .where(and(...conditions))
        .orderBy(desc(posts.createdAt))
        .limit(noLimit ?  Number.MAX_SAFE_INTEGER : 30);

    return Response.json({data: result}, {headers})
}


export async function POST(request: Request) {
    const access = checkAccess(request);
    if (access instanceof Response) {
        return access;
    }

    const rawData = await request.json();
    const parseResult = await schema.safeParseAsync(rawData);
    if (!parseResult.success) {
        return validationFailed(parseResult, headers);
    }

    const {authorId} = (await db.select({authorId: users.id})
        .from(users)
        .where(eq(users.authToken, access))
        .limit(1))[0];

    const {content} = parseResult.data;
    const inserted = await db.insert(posts).values({authorId, content}).returning();

    return Response.json({data: inserted}, {headers})
}