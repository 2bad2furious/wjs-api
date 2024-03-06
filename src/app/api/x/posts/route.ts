import {checkAccess} from "@/app/api/countries/checkAccess";
import {db, posts, users} from "../db";
import {eq,} from "drizzle-orm";
import {schema} from "./schema";
import {getAllPosts, getUserByAccessToken} from "./utils";
import {validationFailed} from "../utils";

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


    const {authorId: currentUserId} = await getUserByAccessToken(access);


    const result = await getAllPosts({currentUserId, search, userId, noLimit})

    const mappedResult = result.map(({likeStatus, ...rest}) => ({...rest, likeStatus: !!likeStatus}))

    return Response.json({data: mappedResult}, {headers})
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