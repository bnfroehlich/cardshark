import React, { useState } from 'react';

const ExitGame = (props) => {
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className='flex-col-container'>
            {!showConfirm
            ?   <button type="button" class="btn btn-danger" disabled={props.disabled} onClick={() => setShowConfirm(true)}>Exit Game</button>
            :   <>
                    <p>Exit this game - are you sure?</p>
                    <div className='flex-container'>
                        <button type="button" class="btn btn-success" onClick={() => setShowConfirm(false)}>No, Stay</button>
                        <button type="button" class="btn btn-danger" disabled={props.disabled} onClick={props.exitLiveGame}>Yes, Exit</button>
                    </div>
                </>
            }
        </div>
    )
}

export default ExitGame;