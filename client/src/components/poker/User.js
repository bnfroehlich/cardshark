
import React from 'react';
import Card from "../games/Card";

function User (props) {
    const user = props.user;
    const shrink = props.shrink;
    const paddingClass = shrink ? 'padding-minVert' : 'padding-medVert';
    return (
        <div className='user-panel' style={{border: '5px solid ' + user.color}} onClick={props.userClicked}>
            <div className={`flex-container-no-padding ${paddingClass}`}>
                <p><strong>{user.username}</strong></p>
                {user.inputPrompt &&
                    <img src={require(`../../imgs/hourglass9.gif`)} alt='hourglass' width='40' height='40'/>
                }
                {user.position === 'dealer' &&
                    <img src={require(`../../imgs/dealer.png`)} alt='dealer' width='40' height='40'/>
                }
            </div>
            {user.wonLastHand &&
                <div className={`flex-container-no-padding ${paddingClass}`}>
                    {user.wonLastHand &&
                        <img src={require(`../../imgs/crown.png`)} alt='crown' width='50' height='38'/>
                    }
                </div>
            }
            <div className={`flex-container-left-align-no-padding ${paddingClass}`}>
                <img src={require(`../../imgs/moneybag.png`)} alt='moneybag' width='50' height='50'/>
                <p><strong>{user.money}</strong></p>
                {(user.bet !== 'undefined' && user.bet != null) &&
                    <>
                        <img src={require(`../../imgs/bet.png`)} alt='bet' width='50' height='50'/>
                        {user.bet > 0
                        ?   <span><strong>{user.bet}</strong></span>
                        :   <img src={require(`../../imgs/check.png`)} alt='check' width='30' height='30'/>
                        }
                    </>
                }
                {shrink &&
                    <>
                        {user.eliminated
                        ?   <img src={require(`../../imgs/bankrupt.png`)} alt='bankrupt' width='79' height='50'/>
                        :   <>
                                {user.folded &&
                                    <img src={require(`../../imgs/fold.png`)} alt='fold' width='79' height='50'/>
                                }
                            </>
                        }
                    </>
                }
            </div>
            {(!shrink || (user.hand.length > 0 && user.hand[0] !== '-')) &&
                <div className={`flex-container-no-padding ${paddingClass}`}>
                    {user.hand.length > 0
                    ?   <>
                            {user.hand.map((card, index) => {
                                const highlightedCards = user.bestHandHighlighted ? user.bestHand : [];
                                const highlighted = highlightedCards.includes(card);
                                return (
                                    (!shrink || card !== '-') && <Card card={card} shrink={shrink} outline={highlighted && props.highlightOutline}/>
                                )
                            }
                            )}
                        </>
                    :   <>
                            {user.eliminated
                            ?   <img src={require(`../../imgs/bankrupt.png`)} alt='bankrupt' width='212' height='134'/>
                            :   <>
                                    {user.folded
                                    ?   <img src={require(`../../imgs/fold.png`)} alt='fold' width='212' height='134'/>
                                    :   <>  
                                            <Card shrink={shrink} />
                                            <Card shrink={shrink} />
                                        </>
                                    }
                                </>
                            }
                        </>
                    }
                </div>
            }
            {(!shrink || user.bestHandScore) &&
                <div className={`flex-container-no-padding ${paddingClass}`}>
                    {user.bestHandScore
                    ?   <span>{user.bestHandScore} &#128269;</span>
                    :   <span>{'\u00A0'}</span>
                    }
                </div>
            }
        </div>
    )
}

export default User;

/*
{(user.money === 0 && !user.eliminated) &&
    <div>all in</div>
}
{(user.folded) &&
    <div>folded</div>
}*/