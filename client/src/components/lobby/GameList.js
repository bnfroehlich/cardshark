import React, {Component} from 'react';
import GameListItem from "./GameListItem";

function GameList ({games, joinGame, leaveGame, startGame, user, joinEnabled}) {
    return (
        <>
            {(games && games.length > 0)
            ?   <div>
                    {games.map((g, index) =>
                        <GameListItem game={g} joinEnabled={joinEnabled} user={user}
                            joinGame={() => joinGame(g)} leaveGame={() => leaveGame(g)} startGame={() => startGame(g)}/>
                    )}
                </div>
            :   <p>(no games are currently open)</p>
            }
        </>
    )
}

export default GameList;