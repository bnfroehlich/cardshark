import React, { Component } from 'react';
import { getLiveGame } from "../services/game";
import Board from "../components/poker/Board";
import Console from "../components/games/Console";
import UserList from '../components/poker/UserList';
import ExitGame from '../components/games/ExitGame';

class Poker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            game: null,
            log: '',
        };
        this.fetchGameData();
        props.socket.onAny((event, ...args) => {
        });
        props.socket.on('log', (arg) => {
            this.setState({log: arg.log});
        });
        props.socket.on('game changed', (arg) => {
            this.setGame(arg.game);
        });
        props.socket.on('choose', (arg) => {
            this.setState({
                inputPrompt: {event: 'choose', arg: arg}
            });
        });
        props.socket.on('bet', (arg) => {
            this.setState({
                inputPrompt: {event: 'bet', arg: arg}
            });
        });
    }

    fetchGameData() {
        getLiveGame()//this.props.id)
        .then(resp => {
            this.setGame(resp.game);
        })
        .catch(err => {
            console.log(err);
        });
    }

    setGame(game) {
        this.setState({
            game,
            log: game.log,
            inputPrompt: game.users.find(u => u._id === this.props.user._id).inputPrompt
        });
    }

    chat(msg) {
        this.props.socket.emit('chat', msg);
    }

    chooseOption(event, arg) {
        this.setState({inputPrompt: null});
        this.props.socket.emit(event, arg);
    }

    bet(arg) {
        if (arg >= this.state.inputPrompt.arg.min && arg <= this.state.inputPrompt.arg.max && arg % 1 === 0) {
            //this.setState({betting: false, minBet: null, betAmt: null});
            this.setState({inputPrompt: null, betAmt: null});
            this.props.socket.emit('bet', arg);
        }
        else {
            alert('Invalid bet amount');
        }
    }

    fold() {
        this.setState({inputPrompt: null, betAmt: null});
        this.props.socket.emit('fold');
    }

    betAmtChanged(e) {
        this.setState({betAmt: e.target.value});
    }

    keyPress(e) {
        if(e.key === 'Enter') {
            e.preventDefault();
            this.bet(this.state.betAmt);
        }
    }

    userClicked(user) {
        let game = this.state.game;
        if (game && game.handsRevealed) {
            if (user.bestHandHighlighted) {
                user.bestHandHighlighted = false;
            }
            else {
                game.users.forEach(u => {
                    u.bestHandHighlighted = false;
                });
                user.bestHandHighlighted = true;
            }
        }
        this.setState({game});
    }

    render() {
        let highlightedCards = null;
        let highlightOutline = null;
        if(this.state.game) {
            const bhHighlightedUser = this.state.game.users.find(u => u.bestHandHighlighted);
            if (bhHighlightedUser) {
                highlightedCards = bhHighlightedUser.bestHand;
                highlightOutline = '5px solid #dc3545';//bhHighlightedUser.color;
            }
        }

        return (
            <>
                {!this.state.game
                ?   <>
                    <div className="centered-alert alert alert-danger" role="alert">
                        Could not load game data
                    </div>
                    <div className='flex-container'>
                        <button className='btn btn-success' onClick={this.fetchGameData.bind(this)}>Try again</button>
                    </div>
                    </>
                :   <>
                    <div className='flex-container-root'>
                        <UserList users={this.state.game.users} userClicked={(u) => this.userClicked(u)} highlightOutline={highlightOutline}/>
                        <div>
                            <Board game={this.state.game} highlightedCards={highlightedCards} highlightOutline={highlightOutline}/>
                            
                            {this.state.inputPrompt &&
                                <div className='flex-container'>
                                {this.state.inputPrompt.event === 'choose' &&
                                    <div>
                                        {this.state.inputPrompt.arg.options.map(o =>
                                            <button className="btn btn-success" onClick={() => this.chooseOption(o.event, o.arg)}>{o.message}</button>
                                        )}
                                    </div>
                                }
                                {this.state.inputPrompt.event === 'bet' &&
                                    <form>
                                        <div className='flex-container'>
                                            <button className="btn btn-danger" onClick={() => this.fold()}>Fold</button>
                                            {this.state.inputPrompt.arg.min
                                            ? <button className="btn btn-success" onClick={() => this.bet(this.state.inputPrompt.arg.min)}>Call {this.state.inputPrompt.arg.min}</button>
                                            : <button className="btn btn-success" onClick={() => this.bet(0)}>Check</button>
                                            }
                                            {this.state.inputPrompt.arg.min !== this.state.inputPrompt.arg.max &&
                                                <div className='form-inline flex-container'>
                                                    <label for="bet-amt">Other Amount: </label>
                                                    <input type="number" class="form-control-sm" id="bet-amt" min={this.state.inputPrompt.arg.min} max={this.state.inputPrompt.arg.max}
                                                        value={this.state.betAmt} onInput={(e) => this.betAmtChanged(e)}
                                                        onKeyPress={(e) => this.keyPress(e)}/>
                                                    <button className="btn btn-success" onClick={() => this.bet(this.state.betAmt)}>Bet</button>
                                                </div>
                                            }
                                        </div>
                                    </form>
                                }
                                </div>
                            }
                                
                        </div>
                        <div className='flex-col-container'>
                            <Console log={this.state.log} chat={(msg) => this.chat(msg)} />
                            <ExitGame exitLiveGame={this.props.exitLiveGame} disabled={Boolean(this.state.inputPrompt)}/>
                        </div>
                    </div>
                    </>
                }
            </>
        )
    }
}

export default Poker;
                //
/*export default function(props) {
    const { id } = useParams();
  
    return <Poker {...props} id={id} />;
}*/
//!(this.state.inputPrompt === null || this.state.inputPrompt === 'undefined' || this.state.inputPrompt === undefined)