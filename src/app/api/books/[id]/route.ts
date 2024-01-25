import books from '../amazon.books.json';

const headers = new Headers({
    "Access-Control-Allow-Origin": "*"
});

export async function GET(request: Request,
                          {params: {id}}: { params: { id: string } }) {
    const idNumber = Number(id);

    if (isNaN(idNumber)) {
        return Response.json({"error": "Invalid id"}, {status: 400, headers});
    }

    for (const book of books) {
        const id = book._id;
        if (id === idNumber) {
            return Response.json(book, {headers});
        }
    }

    return Response.json({"error": "Book not found"}, {status: 404, headers});
}