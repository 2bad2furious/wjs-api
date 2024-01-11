import movies from './imdb-movies.json';

type Movie = (typeof movies)[number];

const MAX_SIZE = 30;

export async function GET(request: Request) {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const type = url.searchParams.get("type");


    const users = filterMovies(search, type);
    const headers = new Headers({
        "Access-Control-Allow-Origin": "*"
    });

    return Response.json(users, {headers});
}

function filterMovies(search: string | null, type: string | null) {
    if (!search && !type) {
        return movies.slice(0, MAX_SIZE);
    }

    const searchLowerCase = search?.toLowerCase();
    const typeLowerCase = type?.toLowerCase();

    const results: Movie[] = [];
    for (const movie of movies) {
        const {type, title} = movie;
        if (results.length === MAX_SIZE) {
            break;
        }

        if (typeLowerCase && type.toLowerCase() !== typeLowerCase) {
            continue;
        }
        if (searchLowerCase && !title.toLowerCase().includes(searchLowerCase)) {
            continue;
        }
        results.push(movie);
    }

    return results;
}