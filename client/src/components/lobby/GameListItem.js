import React from 'react';

function GameListItem ({game, joinGame, leaveGame, startGame, user, joinEnabled}) {
    const hosting = user && game.host._id === user._id;
    const joined = user && game.users.some(u => u._id === user._id);
    return (
        <div className="border flex-container">
            <div>
                <p><strong>{game.title}</strong></p>
                <p><strong>{game.type}</strong></p>
                {game.type === 'Poker' &&
                    <p>Buy-In: {game.buyIn}, Blinds: {game.smallBlind}/{game.bigBlind}</p>
                }
                <p><strong>Host: </strong>{game.host.username}</p>
                <div>
                    <p><strong>Joined: </strong>
                    {game.users &&
                        <span>{game.users.map(u => u.username).join(', ')}</span>
                    }
                    </p>
                </div>
            </div>
            <div>
                {joinEnabled &&
                    <button type="button" className="btn btn-primary"
                        onClick={() => joinGame()} disabled={!joinEnabled}>
                        Join</button>
                }
                {hosting &&
                    <div className="flex-container">
                        <span style={{color: "#28a745"}}><strong> HOSTING </strong></span>
                        <button type="button" className="btn btn-success"
                            onClick={() => startGame()}>
                            Start Game</button>
                        <button type="button" className="btn btn-danger"
                            onClick={() => leaveGame()}>
                            Cancel Game</button>
                    </div>
                }
                {(joined && !hosting) && 
                    <div className="flex-container">
                        <span style={{color: "#28a745"}}><strong> JOINED 🗸 </strong></span>
                        <button type="button" className="btn btn-danger"
                            onClick={() => leaveGame()}>
                            Leave</button>
                    </div>
                }
            </div>
        </div>
    )
}

export default GameListItem;