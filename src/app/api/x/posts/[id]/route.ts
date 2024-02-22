import {checkAccess} from "@/app/api/countries/checkAccess";
import {db, posts, publicPostColumns, publicUserColumns, users} from "@/app/api/x/db";
import {and, eq} from "drizzle-orm";
import {schema} from "../schema";
import {validationFailed} from "@/app/api/x/utils";

//link https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
type UnionToIntersection<U> =
    (U extends any ? (x: U)=>void : never) extends ((x: infer I)=>void) ? I : never
async function getPostById(id: string, {includeToken}: { includeToken?: boolean } = {}) {
    const userColumns = includeToken ? {
        ...publicUserColumns,
        authToken: users.authToken
    } : publicUserColumns;

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

    const {post, author} = results[0];
    return {post, author: author as UnionToIntersection<typeof author>}
}

const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*"
});

export function OPTIONS() {
    return Response.json({}, {headers})
}

export async function GET(request: Request, {params: {id}}: { params: { id: string } }) {
    const access = checkAccess(request);
    if (access instanceof Response) {
        return access;
    }

    const post = await getPostById(id)
    if (!post) {
        return Response.json({error: "Post not found"}, {status: 400, headers});
    }

    return Response.json({data: post}, {headers})
}


export async function PUT(request: Request, {params: {id}}: { params: { id: string } }) {
    const access = checkAccess(request);
    if (access instanceof Response) {
        return access;
    }

    const post = await getPostById(id, {includeToken: true})
    if (!post) {
        return Response.json({error: "Post not found"}, {status: 400, headers});
    }

    if (post.author.authToken !== access) {
        return Response.json({error: "Access denied"}, {status: 403, headers})
    }

    const parseResult = await schema.safeParseAsync(await request.json());
    if (!parseResult.success) {
        return validationFailed(parseResult, headers)
    }

    const {content} = parseResult.data;
    const result = await db.update(posts)
        .set({content, updatedAt: new Date()})
        .where(eq(posts.id, id));

    const updatedPost = await getPostById(id)

    return Response.json({data: updatedPost}, {headers})
}

export async function DELETE(request: Request, {params: {id}}: { params: { id: string } }) {
    const access = checkAccess(request);
    if (access instanceof Response) {
        return access;
    }

    const post = await getPostById(id, {includeToken: true})
    if (!post) {
        return Response.json({error: "Post not found"}, {status: 400, headers});
    }

    if (post.author.authToken !== access) {
        return Response.json({error: "Access denied"}, {status: 403, headers})
    }

    await db.delete(posts).where(eq(posts.id, id));

    return Response.json({data: "deleted"}, {headers})
}