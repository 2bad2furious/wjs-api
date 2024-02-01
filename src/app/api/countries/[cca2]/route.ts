import {checkAccess} from "../checkAccess";
import countries from '../countries-table.json';
const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization"
});

export function OPTIONS(request: Request){
    return Response.json({}, {headers})
}

export function GET(request: Request, {params: {cca2}}: { params: { cca2: string } }) {
    const response = checkAccess(request);
    if (response) {
        return response;
    }

    const result = countries.find(c => c.cca2 === cca2);

    if (result) {
        return Response.json(result, {headers});
    }

    return Response.json({error: "Country not found"}, {headers, status: 404});
}