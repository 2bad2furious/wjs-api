import books from './amazon.books.json';

type Book = (typeof books)[number];

const MAX_SIZE = 30;

const headers = new Headers({
    "Access-Control-Allow-Origin": "*"
});

export async function GET(request: Request) {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");

    const result = filterBooks(search);
    return Response.json(result, {headers});
}

function filterBooks(search: string | null) {
    if (!search) {
        return books.slice(0, MAX_SIZE);
    }

    const searchLowerCase = search?.toLowerCase();

    const results: Book[] = [];
    for (const movie of books) {
        if (results.length === MAX_SIZE) {
            break;
        }
        const {authors, categories, shortDescription, longDescription, title} = movie;
        const valuesToSearchIn = [...authors, ...categories, shortDescription, longDescription, title];

        for (const value of valuesToSearchIn) {
            if (value && value.toLowerCase().includes(searchLowerCase)) {
                results.push(movie);
                break;
            }
        }
    }

    return results;
}