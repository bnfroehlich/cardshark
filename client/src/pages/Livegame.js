import { Link, useNavigate } from "react-router-dom";
import Poker from "./Poker";
import { exitLiveGame as apiExitLiveGame} from "../services/game";

const Livegame = (props) => {
    const navigate = useNavigate();
    
    function exitLiveGame() {
        apiExitLiveGame()
        .then(resp => {
            navigate('/');
        })
        .catch(err => {
            console.log(err);
        });
    }

    return (
        <>
        {props.liveGame
        ?   <>
            {props.liveGame.type === 'Poker' && 
                <Poker user={props.user} exitLiveGame={() => exitLiveGame()} socket={props.socket}/>
            }
            </>
        :   <>
            {props.user
            ?   <div className='flex-container'>You are not in a game right now</div>
            :   <div className='flex-container'>To play you must <Link to="/login">log in</Link></div>
            }
            </>
        }
        </>
    )
  };
  
  export default Livegame;