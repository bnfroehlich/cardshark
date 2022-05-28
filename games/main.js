const { initPoker } = require("./poker.js");
const { colors, shuffle } = require("./util.js");

var liveGames = [];
var finishedGames = [];

exports.launchGame = (game, emitByUID, onByUID, removeAllListenersByUID) => {
    liveGames.push(game);
    game.emitByUID = emitByUID;
    game.onByUID = onByUID;
    game.removeAllListenersByUID = removeAllListenersByUID;
    game.emitAll = (event, ...args) => {
        game.users.forEach(u => {
            game.emitByUID(u._id, event, ...args);
        });
    };
    game.emitByUIndex = (index, event, ...args) => {
        game.emitByUID(game.users[index]._id, event, ...args);
    };
    registerDefaultOnByUID(game);

    let colorList = JSON.parse(JSON.stringify(colors));
    shuffle(colorList);
    game.users.forEach(u => {
        u.color = colorList.pop();
    });

    game.log = '';
    game.printToLog = (text) => {
        game.log += text + "\n";
        game.emitAll('log', {log: game.log});
    }

    game.finish = () => {
        game.users.forEach(u => {
            game.removeAllListenersByUID(u._id);
        });
        const index = liveGames.indexOf(game);
        if (index !== -1) {
            liveGames.splice(index, 1);
            finishedGames.push(game);
        }
    }
    
    if (game.type === 'Poker') {
        initPoker(game);
    }   
}

function registerDefaultOnByUID(game) {
    game.users.forEach(u => {
        game.onByUID(u._id, 'chat', (arg) => {
            game.printToLog(`${u.username}: ${arg}`);
        });
    });
}

exports.getLiveGames = () => {
    return liveGames;
}

exports.getGameUserView = (game, uID) => {
    if (game.getUserView) {
        return game.getUserView(uID);
    }
    return game;
}