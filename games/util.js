var suits = ['C', 'D', 'H', 'S'];
var suitsLong = ['Club', 'Diamond', 'Heart', 'Spade'];
var ranks = [...Array.from({length:9}, (v, k)=>k+2), 'J', 'Q', 'K', 'A'];
var ranksLong = [...Array.from({length:9}, (v, k)=>k+2), 'Jack', 'Queen', 'King', 'Ace'];
var colors = ['lightgreen', 'orange', 'gold', 'green', 'blue', 'purple', 'aquamarine', 'slategray'];

exports.suits = suits;
exports.suitsLong = suitsLong;
exports.ranks = ranks;
exports.ranksLong = ranksLong;
exports.colors = colors;

exports.initDeck = () => {
    let deck = [];
    /*let tempRanks = JSON.parse(JSON.stringify(ranks));
    tempRanks = [ranks[ranks.length-1], ...ranks.slice(0, ranks.length-1)];
    tempRanks = [...tempRanks.slice(0, 6), ...tempRanks.slice(9), ...tempRanks.slice(6, 9)];
    tempRanks.reverse();
    let tempSuits = ['C'];*/
    suits.forEach(s => {
        ranks.forEach(r => {
            deck.push(`${r}${s}`);
        });
    });
    return deck;
}

exports.shuffle = (array) => {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}