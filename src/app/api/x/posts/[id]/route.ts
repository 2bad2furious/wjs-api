import {checkAccess} from "@/app/api/countries/checkAccess";
import {db, posts} from "@/app/api/x/db";
import {eq} from "drizzle-orm";
import {schema} from "../schema";
import {validationFailed} from "@/app/api/x/utils";
import {getPostById, getPostByIdWithToken, getPostWithLikesAndLikeStatus, getUserByAccessToken} from "../utils";


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

    const {authorId: currentUserId} = await getUserByAccessToken(access);

    const post = await getPostWithLikesAndLikeStatus(id, currentUserId)
    if (!post) {
        return Response.json({error: "Post not found"}, {status: 404, headers});
    }

    return Response.json({data: post}, {headers})
}


export async function PUT(request: Request, {params: {id}}: { params: { id: string } }) {
    const access = checkAccess(request);
    if (access instanceof Response) {
        return access;
    }

    const post = await getPostByIdWithToken(id)
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
    await db.update(posts)
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

    const post = await getPostByIdWithToken(id)
    if (!post) {
        return Response.json({error: "Post not found"}, {status: 400, headers});
    }

    if (post.author.authToken !== access) {
        return Response.json({error: "Access denied"}, {status: 403, headers})
    }

    await db.delete(posts).where(eq(posts.id, id));

    return Response.json({data: "deleted"}, {headers})
}