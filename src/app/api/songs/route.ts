import songs from './songs.json';

type Song = (typeof songs)[number];

export async function GET(request: Request) {
    const url = new URL(request.url);

    const pageSize = url.searchParams.get("pageSize");
    const pageSizeNumber = pageSize ? Number(pageSize) : null;
    if (pageSizeNumber !== null && (isNaN(pageSizeNumber) || pageSizeNumber < 1)) {
        return Response.json("Invalid pageSize", {status: 400});
    }

    const page = url.searchParams.get("page");
    const pageNumber = pageSize ? Number(page) : null;
    if (pageNumber !== null && (isNaN(pageNumber) || pageNumber < 1)) {
        return Response.json("Invalid page", {status: 400});
    }

    const search = url.searchParams.get("search");

    const minMsListened = url.searchParams.get("minMsListened")
    const minMsListenedNumber = minMsListened ? Number(minMsListened) : null;
    if (typeof minMsListenedNumber === "number" && isNaN(minMsListenedNumber)) {
        return Response.json("Invalid minMsListened", {status: 400});
    }

    const maxMsListened = url.searchParams.get("maxMsListened")
    const maxMsListenedNumber = maxMsListened ? Number(maxMsListened) : null;
    if (typeof maxMsListenedNumber === "number" && isNaN(maxMsListenedNumber)) {
        return Response.json("Invalid maxMsListened", {status: 400});
    }

    const minDateValue = url.searchParams.get("minDate");
    const minDate = minDateValue ? new Date(minDateValue) : null;
    if (minDate !== null && isNaN(minDate.getTime())) {
        return Response.json("Invalid minDate", {status: 400});
    }

    const maxDateValue = url.searchParams.get("maxDate");
    const maxDate = maxDateValue ? new Date(maxDateValue) : null;
    if (maxDate !== null && isNaN(maxDate.getTime())) {
        return Response.json("Invalid maxDate", {status: 400});
    }

    const songs = filterSongs(search, minMsListenedNumber, maxMsListenedNumber, minDate, maxDate);
    const songsPage = paginate(songs, pageSizeNumber, pageNumber)

    const headers = new Headers({
        "Access-Control-Allow-Origin": "*"
    });

    return Response.json(songsPage, {headers});
}

function filterSongs(search: string | null, minMsListened: number | null, maxMsListened: number | null, minDate: Date | null, maxDate: Date | null) {
    const searchLowerCase = search?.toLowerCase();

    const results: Song[] = [];
    for (const song of songs) {
        const {artistName, trackName, msPlayed, endTime} = song;

        if (searchLowerCase && !artistName.toLowerCase().includes(searchLowerCase) && !trackName.toLowerCase().includes(searchLowerCase)) {
            continue;
        }

        if (minMsListened !== null && msPlayed < minMsListened) {
            continue;
        }
        if (maxMsListened !== null && msPlayed > maxMsListened) {
            continue;
        }

        const endDate = new Date(endTime);
        song.endTime = endDate.toISOString()

        if (minDate && minDate > endDate) {
            continue;
        }
        if (maxDate && maxDate < endDate) {
            continue;
        }

        results.push(song);
    }

    return results;
}

function paginate<T>(items: T[], pageSize: number | null, page: number | null) {
    const fixedPageSize = pageSize ?? 20;
    const fixedPage = page ?? 1;

    const startIndex = (fixedPageSize * (fixedPage - 1));
    const endIndex = startIndex + fixedPageSize;

    const newItems = items.slice(startIndex, endIndex);

    return {
        items: newItems,
        meta: {totalCount: items.length}
    }
}