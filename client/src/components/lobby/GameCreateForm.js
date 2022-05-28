import React, { Component } from 'react';
import PokerCreateForm from './PokerCreateForm';

class GameCreateForm extends Component {
    constructor(props) {
        super(props);
        const game = {
            title: '',
        }
        this.state = {
            game,
            initGame: game,
        };
    }

    handleCreateGame() {
        this.props.handleCreateGame(this.state.game);
        this.setState({game: this.state.initGame});
    }

    /*gameTypeChanged(type) {
        const game = this.state.game;
        game.type = type;
        let params = null;
        if (type === 'Poker') {
            params = {
                buyIn: 500,
                bigBlind: 10,
                smallBlind: 5
            }
        }
        this.setState({game, params});
    }*/

    gameParamsChanged(newParams) {
        const game = {...this.state.game};
        for (const [newParam, newVal] of Object.entries(newParams)) {
            game[newParam] = newVal;
        }
        this.setState({game});
    }

    render() {
        return (
            <>
                <form>
                    <div className="flex-container">
                        <label for="type">Create a new game:</label>
                        <select class="form-select" aria-label="game type selector" name="type" id="type"
                            value={this.state.game.type} onChange={(e) => this.gameParamsChanged({type: e.target.value})}>
                            <option selected value="">Choose type</option>
                            <option value="Poker">Poker</option>
                        </select>
                    </div>
                </form>
                {this.state.game.type === 'Poker' &&
                    <PokerCreateForm game={this.state.game} gameParamsChanged={(newParams) => this.gameParamsChanged(newParams)} />
                }
                {this.state.game.type &&
                    <div className="flex-container">
                        <input type="text" className="form-control w-auto" name="title" id="title" aria-describedby="title" placeholder="Title"
                            value={this.state.game.title} disabled={this.props.disabled} onChange={(e) => this.gameParamsChanged({title: e.target.value})} />
                        <button type="button" className="btn btn-primary"
                            onClick={() => this.handleCreateGame()} disabled={this.props.disabled || !this.state.game.title || !this.state.game.type}>
                            Create</button>
                    </div>
                }
            </>
        );
    }
}
//game={this.state.game} gameParamsChanged={(newParams) => this.gameParamsChanged(newParams)}
export default GameCreateForm;