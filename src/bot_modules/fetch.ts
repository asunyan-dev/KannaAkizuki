

export default async function fetchURL(
    url: string
): Promise<{
    ok: boolean;
    data: {} | null;
    error: string | null
}> {

    const response = await fetch(url).catch(() => null);

    if(!response) {
        return {ok: false, data: null, error: "❌ There was an error with the API, please try again later."};
    };

    if(!response.ok) {
        return {ok: false, data: null, error: "❌ There was an error with the API, please try again later."};
    };

    const data = await response.json().catch(() => null);

    if(!data) {
        return {ok: false, data: null, error: "❌ There was an error with the API, please try again later."};
    };

    return {
        ok: true,
        data: data,
        error: null
    };


}