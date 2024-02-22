import {env} from "@/env.mjs";

const allowedTokens = env.ACCESS_TOKENS
const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization,content-type"
});

export function checkAccess(request: Request) {
    if (!allowedTokens) {
        console.log("missing allowed tokens")
        return Response.json({error: "Server error"}, {status: 500, headers});
    }

    const authorizationHeader = request.headers.get("Authorization");
    if (!authorizationHeader) {
        return Response.json({error: "Authorization header missing"}, {status: 401, headers});
    }
    const [scheme, token] = authorizationHeader?.split(" ");
    if (scheme !== "Custom") {
        return Response.json({error: "Invalid auth scheme provided"}, {status: 401, headers})
    }
    if (!allowedTokens.includes(token)) {
        return Response.json({error: "Unknown token provided"}, {status: 401, headers});
    }

    return token;
}