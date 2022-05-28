import { Outlet, Link, useLocation } from "react-router-dom";
import React from "react";

const Layout = ({user, liveGame, fetchLiveGame}) => {
    const location = useLocation();
    //const fetchLiveGame = fetchLiveGame;
  
    React.useEffect(() => {
        fetchLiveGame();
    }, [location]);
    
  return (
    <>
        <nav className="navbar navbar-expand-lg navbar-light bg-success">
            <Link className="navbar-brand title link" to="/">CardShark</Link>
            <button aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation" className="navbar-toggler" data-target="#navbarContent" data-toggle="collapse" type="button">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarContent">
                <ul className="navbar-nav">
                    <li className="nav-item"><Link className="nav-link" to="/lobby"><span className="link">Lobby</span></Link></li>
                </ul>
                <ul className="navbar-nav ml-auto">
                    {user
                        ?
                            <>
                                <li className="nav-item"><Link className="nav-link" to="/"><span className="link mb-0 h1 margin-lr">Hello, { user.username }</span></Link></li>
                                <li className="nav-item"><a className="nav-link" href="/logout"><span className="link">Log Out</span></a></li>
                            </>
                        :
                            <li className="nav-item"><Link className="nav-link" to="/login"><span className="link">Log In</span></Link></li>
                    }
                </ul>
            </div>
        </nav>

        {(liveGame && !location.pathname.endsWith('livegame')) &&
            <div className="centered-alert alert alert-warning" role="alert">
                You are in a game of {liveGame.type}. To return to your live game, <Link to="/livegame">click here</Link>
            </div>
        }
        
        <Outlet />
    </>
  )
};

export default Layout;

      /*<nav className="navbar navbar-expand-lg navbar-light bg-success">
        <a className="navbar-brand title link" href="/">CardShark</a>
            <button aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation" className="navbar-toggler" data-target="#navbarContent" data-toggle="collapse" type="button">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarContent">
                <ul className="navbar-nav">
                    <li className="nav-item"><a className="nav-link" href="/"><span className="link">Lobby</span></a></li>
                </ul>
            </div>
        </nav>*/