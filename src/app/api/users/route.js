export async function GET(request) {
    const users = [
        {
            id: 1,
            name: "John"
        },
        {
            id: 2,
            name: "John Doe"
        }
    ]
    return new Response(JSON.stringify(users));
}