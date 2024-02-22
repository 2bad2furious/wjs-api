import {SafeParseError} from "zod";

export function validationFailed(parseResult: SafeParseError<unknown>, headers: Headers){
    return Response.json({message: "Invalid data", errors: parseResult.error.flatten()}, {status: 400, headers});
}