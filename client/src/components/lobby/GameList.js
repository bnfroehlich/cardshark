import React, {Component} from 'react';
import GameListItem from "./GameListItem";

class GameList extends Component {

    render() {
        let gameList = <p>no games</p>;
        if (this.props.games) {
            gameList = (
                <div>
                    {this.props.games.map((g, index) =>
                        <GameListItem game={g} joinEnabled={this.props.joinEnabled} user={this.props.user}
                            joinGame={() => this.props.joinGame(g)} leaveGame={() => this.props.leaveGame(g)} startGame={() => this.props.startGame(g)}/>
                    )}
                </div>
            )
        }
        return gameList;
    }
}

export default GameList;