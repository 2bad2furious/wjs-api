import {checkAccess} from "@/app/api/countries/checkAccess";
import {db, publicUserColumns, users} from "@/app/api/x/db";
import {eq} from "drizzle-orm";

const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization"
});

export function OPTIONS() {
    return Response.json({}, {headers})
}

export async function GET(request: Request, {params: {id}}: { params: { id: string } }) {
    const access = checkAccess(request);
    if (access instanceof Response) {
        return access;
    }

    const userList = await db.select(publicUserColumns).from(users)
        .where(eq(users.id, id)).limit(1);

    const user = userList[0]

    if (!user) {
        return Response.json({message: "User not found"}, {status: 404, headers});
    }

    return Response.json({data: user}, {headers})
}