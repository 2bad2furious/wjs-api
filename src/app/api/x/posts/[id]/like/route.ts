import {checkAccess} from "@/app/api/countries/checkAccess";
import {getPostWithLikeStatus, getUserByAccessToken} from "../../utils";
import {db, postsLikes} from "@/app/api/x/db";

const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*"
});


export function OPTIONS() {
    return Response.json({}, {headers})
}

export async function PATCH(request: Request, {params: {id}}: { params: { id: string } }) {
    const access = checkAccess(request);
    if (access instanceof Response) {
        return access;
    }

    const {authorId} = await getUserByAccessToken(access);

    const postData = await getPostWithLikeStatus(id, authorId)
    if (!postData) {
        return Response.json({error: "Post not found"}, {status: 404, headers});
    }

    if(!postData.likeStatus){
        await db.insert(postsLikes)
            .values({postId: id, authorId})
    }

    return Response.json({success: true}, {headers})
}