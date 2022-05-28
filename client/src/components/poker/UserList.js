import React, { useState } from 'react';
import User from "./User";

function UserList(props) {
    const [shrink, setShrink] = useState(true);

    const handleOnChange = () => {
        setShrink(!shrink);
    };

    return (
        <div className='user-list'>
            <div className='flex-col-container'>
                {props.users.map((u, index) =>
                    <User key={index} user={u} shrink={shrink} userClicked={() => props.userClicked(u)} highlightOutline={props.highlightOutline}/>
                )}
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="shrink" checked={shrink} onChange={handleOnChange}/>
                    <label class="form-check-label" for="shrink">
                        Shrink hands
                    </label>
                </div>
            </div>
        </div>
    )
}

export default UserList;