import movies from './imdb-movies.json';

type Movie = (typeof movies)[number];

const MAX_SIZE = 30;

export async function GET(request: Request) {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const type = url.searchParams.get("type");
    const minRatingRaw = url.searchParams.get("minRating")
    const minRating = minRatingRaw !== null ? Number(minRatingRaw) : null;
    if (typeof minRating === "number" && isNaN(minRating)) {
        return Response.json("Invalid minRating", {status: 400});
    }
    const maxRatingRaw = url.searchParams.get("maxRating")
    const maxRating = maxRatingRaw !== null ? Number(maxRatingRaw) : null;
    if (typeof maxRating === "number" && isNaN(maxRating)) {
        return Response.json("Invalid maxRating", {status: 400});
    }



    const users = filterMovies(search, type, minRating, maxRating);
    const headers = new Headers({
        "Access-Control-Allow-Origin": "*"
    });

    return Response.json(users, {headers});
}

function filterMovies(search: string | null, type: string | null, minRating: number | null, maxRating: number | null) {
    if (!search && !type && minRating === null && maxRating === null) {
        return movies.slice(0, MAX_SIZE);
    }

    const searchLowerCase = search?.toLowerCase();
    const typeLowerCase = type?.toLowerCase();

    const results: Movie[] = [];
    for (const movie of movies) {
        const {type, title, imdbScore} = movie;
        if (results.length === MAX_SIZE) {
            break;
        }

        if (typeLowerCase && type.toLowerCase() !== typeLowerCase) {
            continue;
        }
        if (searchLowerCase && !title.toLowerCase().includes(searchLowerCase)) {
            continue;
        }
        if (searchLowerCase && !title.toLowerCase().includes(searchLowerCase)) {
            continue;
        }

        if (minRating !== null && imdbScore < minRating) {
            continue;
        }
        if (maxRating !== null && imdbScore > maxRating) {
            continue;
        }
        results.push(movie);
    }

    return results;
}