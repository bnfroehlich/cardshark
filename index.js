const path = require('path');
const express = require('express');
const cookieParser = require("cookie-parser");
const { adminAuth, userAuth, authenticate, authenticateByJWTToken } = require("./middleware/auth.js");

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const PORT = 3001;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false})); //Parse URL-encoded bodies

const connectDB = require("./db");
//Connecting the Database
connectDB();

const { launchGame, getLiveGames, getGameUserView } = require("./games/main.js");

app.use("/api/auth", require("./Auth/route"))
//app.get("/admin", adminAuth, (req, res) => res.send("Admin Route"));
//app.get("/basic", userAuth, (req, res) => res.send("User Route"));

//authenticate logged in user
app.use(authenticate);

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, 'client/build')));

app.get("/logout", (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: "1" });
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "An error occurred",
            error: error.message,
        });
    }
});

var games = [
        /*{title: 'g1', id: 1, type: 'hearts', host: {username: 'Joe'}, users: [{username: 'Sue'}]},
        {title: 'g2', id: 2, type: 'spades', host: {username: 'Bob'}, users: [{username: 'Mary'}]},
        {title: 'g3', id: 3, type: 'euchre', host: {username: 'Jim'}, users: [{username: 'Ann'}]},*/
    ];

//map of id -> {user: userObj, socket: socketObj, etc...}
var connectedUsers = {};

app.get('/api/games', (req, res) => {
    res.json({
        games: games
    });
});

app.post('/api/creategame', (req, res) => {
    if (req.user && req.body.game) {
        const newGame = req.body.game;
        const userWithPWDeleted = delUserPW(req.user);
        newGame.host = userWithPWDeleted;
        newGame.users = [userWithPWDeleted];
        const maxId = Math.max(...games.map(g => g.id));
        newGame.id = maxId + 1;

        games.unshift(newGame);
        res.json({
            result: 'success',
            games: games
        });
        lobbyGamesChanged();
    }
    else {
        res.json({
            result: 'fail',
            games: games
        });
    }
});

app.post('/api/joingame', (req, res) => {
    let result = 'fail';
    if (req.user && req.body.id) {
        const id = req.body.id;
        const gameResults = games.filter(g => g.id === id);
        if (gameResults.length === 1) {
            const userWithPWDeleted = delUserPW(req.user);
            gameResults[0].users.push(userWithPWDeleted)
            result = 'success';
            lobbyGamesChanged();
        }
        else {
            result = 'fail';
        }
    }
    else {
        result = 'fail';
    }
    res.json({
        result: result,
        games: games
    });
});

app.post('/api/leavelobbygame', (req, res) => {
    let result = 'fail';
    if (req.body.id && req.user) {
        const id = req.body.id;
        const gameResults = games.filter(g => g.id === id);
        if (gameResults.length === 1) {
            const game = gameResults[0];
            if (game.host._id === req.user._id) {
                //if host leaves, destroy game
                games.splice(games.indexOf(game), 1);
                result = 'success';
            }
            else if (game.users.some(u => u._id === req.user._id)) {
                game.users = game.users.filter(u => u._id !== req.user._id)
                result = 'success';
            }
            lobbyGamesChanged();
        }
    }
    res.json({
        result: result,
        games: games
    });
});

app.post('/api/exitlivegame', (req, res) => {
    let result = 'fail';
    if (req.user) {
        let game = null;
        if (req.body.id !== undefined && req.body.id !== 'undefined' && req.body.id !== null) {
            game = getLiveGames().find(g => g.id == req.body.id);
        }
        else {
            game = getLiveGame(req.user._id);
        }
        if (game) result = game.exitUserByID(req.user._id) ? 'success' : 'fail';
    }
    res.json({
        result,
        game: null
    });
});

app.post('/api/startgame', (req, res) => {
    let result = 'fail';
    let message = null;
    if (req.body.id && req.user) {
        const id = req.body.id;
        const gameResults = games.filter(g => g.id === id);
        if (gameResults.length === 1) {
            const game = gameResults[0];
            if (game.users.length < 2) {
                result = 'fail';
                message = 'error: must have at least 2 players to start game';
            }
            else if (game.host._id === req.user._id) {
                result = 'success';
                games.splice(games.indexOf(game), 1);
                game.users.forEach(u => emitByUID(u._id, 'start'));//, {type: game.type, id: game.id}));
                launchGame(game, emitByUID, onByUID, removeAllListenersByUID);
                lobbyGamesChanged();
            }
        }
    }
    res.json({
        result: result,
        message: message,
        games: games
    });
});

function getSocketsForGame(game) {
    let sockets = [];
    for (const [userId, obj] of Object.entries(connectedUsers)) {
        if (userId === game.host._id || game.users.some(u => u._id === userId)) {
            sockets.push(obj.socket);
        }
    }
    return sockets;
}

function lobbyGamesChanged() {
    io.emit('games changed', {games});
}

app.get('/api/livegame', (req, res) => {
    if (req.user) {
        let game = null;
        if (req.query.id !== undefined && req.query.id !== 'undefined' && req.query.id !== null) {
            game = getLiveGames().find(g => g.id == req.query.id);
        }
        else {
            game = getLiveGame(req.user._id);
        }

        if(game) {
            game = getGameUserView(game, req.user._id);
        }
        res.json({
            result: game ? 'success' : 'fail',
            game
        });
    }
    else {
        res.json({
            result: 'fail',
            game: null
        });
    }
});

io.on('connection', (socket) => {
    const parseCookie = (aName) => {
        const name = aName + '=';
        const cDecoded = decodeURIComponent(socket.handshake.headers.cookie);
        const cArr = cDecoded.split(';');
        let res;
        cArr.forEach(val => {
            if (val.indexOf(name) === 0) res = val.substring(name.length);
            })
        return res;
    }
    const jwtToken = parseCookie('jwt');
    authenticateByJWTToken(jwtToken, (user) => {
        if (user) {
            if (connectedUsers[user._id]) {
                const livegame = getLiveGame(user._id);
                if (livegame && livegame.printToLog) livegame.printToLog(`${user.username} reconnected`);
                const prevSocket = connectedUsers[user._id].socket;
                if (prevSocket) {
                    prevSocket.eventNames().forEach(eventName => {
                        const listeners = prevSocket.listeners(eventName);
                        listeners.forEach(l => {
                            socket.on(eventName, l);
                        })
                    });
                    /*console.log('rereging on events: ' + JSON.stringify(prevOnEvents));
                    if (prevOnEvents) {
                        prevOnEvents.forEach(onEv => {
                            socket.on(onEv.event, onEv.fn);
                        });
                    }
                    */
                }                
            }
            if (!socket.eventNames().includes('disconnect')) {
                socket.on('disconnect', (reason) => {
                    const livegame = getLiveGame(user._id);
                    if (livegame && livegame.printToLog) livegame.printToLog(`${user.username} disconnected`);
                });
            }
            connectedUsers[user._id] = {
                user,
                socket
            };
            /*socket.onAny((event, ...args) => {
                onByUID(user._id, event, ...args);
            });*/
        }
    });
    //io.emit('chat', msg);
});

function getLiveGame(userID) {
    return getLiveGames().find(g => g.users.some(u => !u.exited && u._id == userID));
}

function onByUID(userID, event, fn) {
    const connectedUser = connectedUsers[userID];
    if (connectedUser) {
        connectedUser.socket.on(event, fn);
    }
    /*const liveGame = getLiveGameByUserID(userID);
    if (liveGame) {
        liveGame.onByUID(userID, event, ...args);
        //if (event === 'chat') {
        //    getSocketsForGame(liveGame).forEach(s => {
        //        s.emit('chat', `${connectedUsers[userID].user.username}: ${args}`);
        //    });
        //}
    }*/
}

function emitByUID(userID, event, ...args) {
    const connectedUser = connectedUsers[userID];
    if (connectedUser) {
        connectedUser.socket.emit(event, ...args);
    }
}

function removeAllListenersByUID(userID, event) {
    const connectedUser = connectedUsers[userID];
    if (connectedUser) {
        connectedUser.socket.removeAllListeners(event);
    }
}

function delUserPW(user) {
    const newUser = JSON.parse(JSON.stringify(user));
    delete newUser.password;
    delete newUser.role;
    delete newUser.email;
    return newUser;
}

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client/build', 'index.html'));
});

app.get('*', (req, res) => {
    //res.sendFile(path.resolve(__dirname, 'client/build', 'lobby.html'));
    res.send('hello world');
});

server.listen(process.env.PORT || PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

// Handling Error
process.on("unhandledRejection", err => {
    console.log(`An error occurred: ${err.message}`)
    server.close(() => process.exit(1))
  })