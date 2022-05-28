import React, { useEffect } from 'react';

function PokerCreateForm({game, gameParamsChanged}) {
    useEffect(() => {
        gameParamsChanged({buyIn: 500, bigBlind: 10, smallBlind: 5})
    }, []);
    return (
        <form>
            <div className="flex-container">
                <label for="buyIn">Buy In:</label>
                <input type="number" className="form-control"  aria-describedby="buyIn" id="buyIn" min="1"
                    value={game.buyIn} onChange={(e) => gameParamsChanged({buyIn: e.target.value})}/>
                <label for="smallBlind">Small Blind:</label>
                <input type="number" className="form-control" name="smallBlind" aria-describedby="smallBlind" id="smallBlind" min="1"
                        value={game.smallBlind} onChange={(e) => gameParamsChanged({smallBlind: e.target.value})}/>
                <label for="bigBlind">Big Blind:</label>
                <input type="number" className="form-control" name="bigBlind" aria-describedby="bigBlind" id="bigBlind" min="1"
                        value={game.bigBlind} onChange={(e) => gameParamsChanged({bigBlind: e.target.value})}/>
            </div>
        </form>
    )
}

export default PokerCreateForm;