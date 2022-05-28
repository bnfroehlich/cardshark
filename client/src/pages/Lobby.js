import React, { Component } from 'react';
import { getAllGames, createGame, joinGame, leaveLobbyGame, startGame } from "../services/game";
import GameList from "../components/lobby/GameList";
import GameCreateForm from '../components/lobby/GameCreateForm';
import { Link, useNavigate } from 'react-router-dom';

class Lobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            games: null,
            inLobbyGame: false,
        };
        props.socket.on('games changed', (resp) => {
            this.setGames(resp.games);
        });
        this.fetchGameList();
    }

    fetchGameList() {
        getAllGames()
        .then(resp => {
            this.setGames(resp.games);
        })
        .catch(err => {
            console.log(err);
        });
    }

    handleCreateGame(game) {
        createGame(game)
        .then(resp => {
            this.setGames(resp.games);
            this.listenForGameStart();
        })
        .catch(err => {
            console.log(err);
        });
    }

    handleJoinGame(game) {
        joinGame(game.id)
        .then(resp => {
            this.setGames(resp.games);
            this.listenForGameStart()
        })
        .catch(err => {
            console.log(err);
        });
    }

    handleLeaveGame(game) {
        leaveLobbyGame(game.id)
        .then(resp => {
            this.setGames(resp.games);
        })
        .catch(err => {
            console.log(err);
        });
    }

    listenForGameStart() {
        this.props.socket.on('start', (game) => {
            this.props.navigate(`/livegame`);
        });
    }

    handleStartGame(game) {
        startGame(game.id)
        .then(resp => {
            if (resp.result === 'fail') {
                alert(resp.message);
            }
            this.setGames(resp.games);
        })
        .catch(err => {
            console.log(err);
        });
    }

    setName(name) {
        this.setState({name: name});
    }

    setGames(games) {
        if(games) {
            const id = this.props.user ? this.props.user._id : '';
            const hosting = games.some(g => g.host._id === id);
            const joined = games.some(g => g.users.some(u => u._id === id));
            this.setState({
                games: games,
                inLobbyGame: hosting || joined
            });
        }
    }

    render() {
        const games = this.state.games;
        const readyToJoin = this.props.user && !this.state.inLobbyGame && !this.props.liveGame;
        return (
            <div className="centered-body">
                <p className="title">Welcome to the lobby</p>
                {!this.props.user &&
                    <p>Note: to join a game you must <Link to="/login">log in</Link></p>
                }
                {readyToJoin &&
                    <GameCreateForm disabled={!readyToJoin}
                        handleCreateGame={(g) => this.handleCreateGame(g)} />
                }
                <p className='title'>Games:</p>
                <GameList games={games} joinEnabled={readyToJoin} user={this.props.user}
                    joinGame={(g) => this.handleJoinGame(g)} leaveGame={(g) => this.handleLeaveGame(g)} startGame={(g) => this.handleStartGame(g)}/>
            </div>
        )
    }
  };

  export default function(props) {
    const navigate = useNavigate();
  
    return <Lobby {...props} navigate={navigate} />;
  }