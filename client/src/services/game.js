export async function getAllGames() {
    try {
        const resp = await fetch('/api/games');
        return await resp.json();
    } catch (err) {
        console.log(err);
        return [];
    }
}

export async function createGame(game) {
    try {
        const resp = await fetch(`/api/creategame`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({game: game})
        });
        return await resp.json();
    } catch (err) {
        console.log(err);
        return [];
    }
}

export async function joinGame(id) {
    try {
        const resp = await fetch(`/api/joingame`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: id})
        });
        return await resp.json();
    } catch (err) {
        console.log(err);
        return [];
    }
}

export async function leaveLobbyGame(id) {
    try {
        const resp = await fetch(`/api/leavelobbygame`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: id})
        });
        return await resp.json();
    } catch (err) {
        console.log(err);
        return [];
    }
}

export async function startGame(id) {
    try {
        const resp = await fetch(`/api/startgame`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: id})
        });
        return await resp.json();
    } catch (err) {
        console.log(err);
        return [];
    }
}

export async function getLiveGame(id) {
    try {
        const resp = await fetch(`/api/livegame?id=${id}`);
        return await resp.json();
    } catch (err) {
        console.log(err);
        return [];
    }
}

export async function exitLiveGame() {
    try {
        const resp = await fetch(`/api/exitlivegame`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
        });
        return await resp.json();
    } catch (err) {
        console.log(err);
        return [];
    }
}