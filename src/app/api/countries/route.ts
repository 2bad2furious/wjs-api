import countries from './countries-table.json';
import {checkAccess} from "./checkAccess";

type Country = (typeof countries)[number];

const MAX_SIZE = 30;

const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization"
});
export function OPTIONS(request: Request){
    return Response.json({}, {headers})
}

export async function GET(request: Request) {
    const response = checkAccess(request);
    if (response) {
        return response;
    }
    const url = new URL(request.url);

    const search = url.searchParams.get("search");

    const countries = filterCountries(search);

    return Response.json(countries, {headers});
}

function filterCountries(search: string | null) {
    if (!search) {
        return countries.slice(0, MAX_SIZE);
    }

    const searchLowerCase = search?.toLowerCase();

    const results: Country[] = [];
    for (const country of countries) {
        if (results.length === MAX_SIZE) {
            break;
        }

        const stringValues = [country.country, country.cca2, country.cca3];
        const matches = stringValues.some(v => v.toLowerCase().includes(searchLowerCase));

        if (!matches) {
            continue;
        }

        results.push(country);
    }

    return results;
}