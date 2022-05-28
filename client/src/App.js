
import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Livegame from "./pages/Livegame";
import './styles.css';
import { Component } from 'react';
import { getUser } from "./services/auth";
import { getLiveGame } from "./services/game";
import { io } from 'socket.io-client';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      socket: io()
    };
    this.fetchLiveGame();
    this.fetchUser();
    
  }

  fetchUser() {
      getUser()
      .then(resp => {
          this.setState({
            user: resp.user
          });
      })
      .catch(err => {
          console.log(err);
      });
  }

  fetchLiveGame() {
      getLiveGame()
      .then(resp => {
          this.setState({
            liveGame: resp.game
          });
      })
      .catch(err => {
          console.log(err);
      });
  }

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout user={this.state.user} liveGame={this.state.liveGame} fetchLiveGame={() => this.fetchLiveGame()}/>}>
            <Route index element={<Home user={this.state.user}/>} />
            <Route path="lobby" element={<Lobby user={this.state.user} liveGame={this.state.liveGame} fetchLiveGame={() => this.fetchLiveGame()} socket={this.state.socket}/>} />
            <Route path="livegame" element={<Livegame user={this.state.user} liveGame={this.state.liveGame} fetchLiveGame={() => this.fetchLiveGame()} socket={this.state.socket} />} />
            <Route path="login" element={<Login />} />
            <Route path="login/:status" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="register/:status" element={<Register />} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;