import {checkAccess} from "@/app/api/countries/checkAccess";
import {db, publicUserColumns, users} from "@/app/api/x/db";
import {eq} from "drizzle-orm";
import {z} from "zod";
import {validationFailed} from "@/app/api/x/utils";

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

    const userList = await db.select(publicUserColumns).from(users)
        .where(eq(users.id, id)).limit(1);

    const user = userList[0]

    if (!user) {
        return Response.json({message: "User not found"}, {status: 404, headers});
    }

    return Response.json({data: user}, {headers})
}

const schema = z.object({
    fullName: z.string().min(2).max(30)
})

export async function PUT(request: Request, {params: {id}}: { params: { id: string } }) {
    const access = checkAccess(request);
    if (access instanceof Response) {
        return access;
    }

    const userList = await db.select().from(users)
        .where(eq(users.id, id)).limit(1);
    const user = userList[0]

    if (!user) {
        return Response.json({message: "User not found"}, {status: 404, headers});
    }

    if(access !== user.authToken){
        return Response.json({message: "You can only edit your own data"}, {status: 403, headers});
    }

    const parseResult = await schema.safeParseAsync(await request.json());

    if(!parseResult.success){
        return validationFailed(parseResult, headers);
    }

    const updateUsers = await db.update(users)
        .set({fullName: parseResult.data.fullName})
        .where(eq(users.id, id))
        .returning(publicUserColumns);

    const updateUser = updateUsers[0];

    return Response.json({data: updateUser}, {headers})
}