import React from 'react';
import Card from "../games/Card";

function Board (props) {
    const game = props.game;
    if(game.table && window.innerWidth >= 500) {
        while(game.table.length < 5) game.table.push(null);
    }
    return (
        <div className='board-container'>
            <div className='flex-container'>
                {(game.table && game.table.length > 0)
                ?   <>
                        {game.table.map((card, index) => 
                            <Card key={index} card={card} outline={props.highlightedCards && props.highlightedCards.includes(card) && props.highlightOutline}/>
                        )}
                    </>
                :   <>
                        <Card />
                        <Card />
                        <Card />
                        <Card />
                        <Card />
                    </>
                }
            </div>
            <br />
            <div className='flex-container'>
                <img src={require(`../../imgs/pot2.png`)} alt='pot' width='50' height='50'/>
                <p className='w-text-b-shadow'><strong>{game.pot}</strong></p>
            </div>
            {game.sidepots.map((sp, index) =>
                <div key={index} className='flex-container'>
                    <img src={require(`../../imgs/sidepot2.png`)} alt='pot' width='50' height='50'/>
                    <p className='w-text-b-shadow'><strong>for {sp.usernames.join(', ')}</strong></p>
                    <p className='w-text-b-shadow'><strong>{sp.pot}</strong></p>
                </div>
            )}
        </div>
    )
}

export default Board;