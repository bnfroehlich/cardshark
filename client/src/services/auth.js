export async function getUser() {
    try {
        const resp = await fetch('/api/auth/check');
        return await resp.json();
    } catch (err) {
        console.log(err);
        return [];
    }
}