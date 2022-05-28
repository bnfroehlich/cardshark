import React from 'react';

const size = [91, 134];

const Card = (props) => {
    let file = props.card ? (props.card.replace('-', 'sharkcardback')) : 'blankcardback';
    return (
        <div>
            {(props.card && !(props.shrink && props.card === '-'))
            ?   <img src={require(`../../cardimgs/${file}.png`)} alt={`card:${props.card}`} width={size[0]} height={size[1]}
                    style={{outline: props.outline}}/>
            :   <div style={{width: `${size[0]}px`, height: `${props.shrink ? 1 : size[1]}px`}}>&nbsp;</div>
            }
        </div>
    )
}

export default Card;