import users from './data.json';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");


    const users = filterUsers(search);
    const headers = new Headers({
        "Access-Control-Allow-Origin": "*"
    });

    return Response.json(users, {headers});
}

function filterUsers(search: string | null) {
    if (!search) {
        return users;
    }

    const searchLowerCase = search.toLowerCase();

    return users.filter(u => u.email.toLowerCase().includes(searchLowerCase) || u.username.toLowerCase().includes(searchLowerCase))
}