const { initDeck, shuffle, suits, suitsLong, ranks, ranksLong } = require("./util.js");

exports.initPoker = (game) => {
    game.deck = initDeck();
    if (!game.buyIn) game.buyIn = 100;//(20 + Math.floor(Math.random()*10)*10);
    game.users.forEach(u => {
        u.money = game.buyIn;
        u.hand = [];
    });
    game.pot = 0;
    game.table = [];
    game.discard = [];
    game.sidepots = [];

    if (!game.smallBlind) game.smallBlind = 1;
    if (!game.bigBlind) game.bigBlind = 2;

    game.getUserView = (uID) => concealHands(game, uID);
    game.exitUserByID = (uID) => {
        const user = game.users.find(u => u._id === uID);
        if(!user) return false;
        game.printToLog(`${user.username} exited the game, and their money was spread among all other players`);
        eliminate(game, user);
        user.folded = true;
        user.exited = true;

        const usersToDisperseMoneyTo = game.users.filter(u => !u.eliminated);
        const amt = Math.floor(user.money/usersToDisperseMoneyTo.length);
        usersToDisperseMoneyTo.forEach(u => {
            u.money += amt;
            user.money -= amt;
        });
        game.pot += user.money;
        user.money = 0;

        resolveSidepots(game);
        
        if (game.users.filter(u => !u.eliminated).length === 1) {
            const activePlayer = game.users.find(u => u.inputPrompt);
            if (activePlayer) {
                game.removeAllListenersByUID(activePlayer._id);
                activePlayer.inputPrompt = null;
            }
            game.printToLog(`Game Over\nBig ${game.users.find(u => !u.eliminated).username} wins!`);
            game.finish();
        }
        gameChanged(game);
        return true;
    };

    game.handNum = 0;
    game.printToLog(`This is No Limit Holdem Poker\n`
        + `Buy-in: ${game.buyIn}\n`
        + `Small Blind: ${game.smallBlind}\n`
        + `Big Blind: ${game.bigBlind}\n`
        + `Players: ${game.users.map(u => u.username).join(', ')}`);
    takeGameAction('starthand', game);
}

function takeGameAction(name, game, index, next) {
    //console.log('taking game action: ' + name + ' index: ' + index + ' next: ' + next);
    if (userInputActions[name]) {
        takeUserInputAction(name, game, index, next);
    }
    else if (autoGameActions[name]) {
        takeAutoGameAction(name, game, next);
    }
    gameChanged(game);
}

function takeUserInputAction(name, game, index, next) {
    const actionFn = userInputActions[name];
    const {targetID, event, arg, replyEvents} = actionFn(game, index, next);
    game.emitByUID(targetID, event, arg);
    game.users.find(u => u._id === targetID).inputPrompt = {event, arg};
    replyEvents.forEach(replyEvent => {
        game.onByUID(targetID, replyEvent.event, (arg) => {
            replyEvents.forEach(re => {
                //remove all events we were listening for
                game.removeAllListenersByUID(targetID, re.event);
                delete game.users.find(u => u._id === targetID).inputPrompt;
            });
            const nextAction = replyEvent.action(arg);
            if (nextAction) {
                takeGameAction(nextAction.name, game, nextAction.index, nextAction.next);
            }
            else {
                gameChanged(game);
            }
        });
    });
}

function takeAutoGameAction(name, game, next) {
    let actionFn = autoGameActions[name];
    const nextAction = actionFn(game, next);
    if (nextAction) {
        takeGameAction(nextAction.name, game, nextAction.index, nextAction.next);
    }
}

function eliminate(game, user) {
    if (!user.eliminated) {
        user.eliminated = true;
        game.printToLog(`${user.username} is eliminated`);
        game.smallBlindNextHand = game.smallBlind * 2;
        game.bigBlindNextHand = game.bigBlind * 2;
    }
}

var autoGameActions = {
    'starthand': (game) => {
            game.handNum++;
            game.printToLog('---\nHand ' + game.handNum);
            

            const winningUsers = game.users.filter(u => u.wonLastHand);
            const prize = Math.floor(game.pot/winningUsers.length);
            winningUsers.forEach(u => {
                u.money += prize;
                game.pot -= prize;
            });
            game.sidepots.forEach(sp => {
                const spPrize = Math.floor(sp.pot/sp.winningUsers.length);
                sp.winningUsers.forEach(u => {
                    u.money += spPrize;
                    sp.pot -= spPrize;
                });
                game.pot += sp.pot;
            });
            game.sidepots = [];

            game.users.forEach(u => {
                game.deck.push(...u.hand);
                u.hand = [];
                u.folded = false;
                //u.totalBetThisHand = 0;
                u.bet = null;
                u.bestHand = null;
                u.bestHandScore = null;
                u.wonLastHand = false;
            });
            game.deck.push(...game.table);
            game.table = [];
            game.deck.push(...game.discard);
            game.discard = [];
            
            shuffle(game.deck);
            game.handsRevealed = false;

            if (game.smallBlindNextHand) {
                game.printToLog(`Blinds increase to ${game.smallBlindNextHand}/${game.bigBlindNextHand}`);
                game.smallBlind = game.smallBlindNextHand;
                game.smallBlindNextHand = null;
            }
            if (game.bigBlindNextHand) {
                game.bigBlind = game.bigBlindNextHand;
                game.bigBlindNextHand = null;
            }

            let dealerIndex = game.users.findIndex(u => u.position === 'dealer');
            if (dealerIndex === -1) {
                dealerIndex = Math.floor(Math.random() * game.users.length);
                game.users[dealerIndex].position = 'dealer';
            }
            
            game.users[dealerIndex].position = '';
            dealerIndex = nextUInd(dealerIndex, game);
            game.users[dealerIndex].position = 'dealer';
            let smallBlindIndex = game.users.filter(u => !u.eliminated).length > 2 ? nextUInd(dealerIndex, game) : dealerIndex;

            
            /*const fiveCards = [game.deck.pop(), game.deck.pop(), game.deck.pop(), game.deck.pop(), game.deck.pop()];
            game.table = game.table.concat(fiveCards)
            game.users.forEach(u => {
                if(!u.eliminated) {
                    u.hand.push(game.deck.pop());
                    u.hand.push(game.deck.pop());
                }
            });
            return {name: 'showdown'};*/
            return {name: 'smallblind', index: smallBlindIndex}
        },
    'deal': (game) => {
            game.printToLog('Hands are dealt');
            game.users.forEach(u => {
                if(!u.eliminated && !u.folded) {
                    u.hand.push(game.deck.pop());
                    u.hand.push(game.deck.pop());
                }
            });
            return {name: 'bet', next: 'flop'}
        },
    'flop': (game) =>  {
            const flop = [game.deck.pop(), game.deck.pop(), game.deck.pop()];
            game.printToLog(`Flop: ${flop.join(' ')}`);
            game.table = game.table.concat(flop)
            return {name: 'bet', next: 'turn'}
        },
    'turn': (game) =>  {
            const turn = game.deck.pop();
            game.printToLog(`Turn: ${turn}`);
            game.table.push(turn);
            return {name: 'bet', next: 'river'}
        },
    'river': (game) => {
            const river = game.deck.pop();
            game.printToLog(`River: ${river}`);
            game.table.push(river);
            return {name: 'bet', next: 'showdown'}
        },
    'showdown': (game) => {
            const handList = game.users.filter(u => u.hand.length > 0).map(u => `${u.username} has ${u.hand.join(' ')}`).join(', ');
            game.printToLog(`Showdown: ${handList}`);
            game.handsRevealed = true;
            return {name: 'endhand'}
        },
    'endhand': (game) => {
            game.printToLog('Hand Ends');
            let liveUsers = game.users.filter(u => !u.folded && !u.eliminated);
            if (liveUsers.length > 1) {
                liveUsers.forEach(u => {
                    const possHands = getAllCombos([...u.hand, ...game.table], 5);
                    u.bestHand = getHighHands(possHands)[0];
                    const score = scoreHand(u.bestHand);
                    u.bestHandScore = `${score.category}${score.desc}`;
                });
                
                //const decTBRank = assignPlaces(liveUsers);
                //const winningUsers = liveUsers.filter(u => u.placeLastHand === 1);
                const {winningUsers, decTBRank} = getWinningUsers(liveUsers);
                winningUsers.forEach(u => {
                    u.wonLastHand = true;
                });
                const msg = buildWinningUsersMsg(winningUsers, decTBRank);
                game.printToLog(msg);

                game.sidepots.forEach((sp, ind) => {
                    const spUsers = game.users.filter(u => sp.userIDs.includes(u._id) && !u.folded && !u.eliminated);
                    if (spUsers.length > 1) {
                        const {winningUsers: spWinningUsers, decTBRank: spdecTBRank} = getWinningUsers(spUsers);
                        sp.winningUsers = spWinningUsers;
                        const spMsg = buildWinningUsersMsg(spWinningUsers, spdecTBRank);
                        game.printToLog(`Sidepot for ${sp.usernames.join(' and ')}: ${spMsg}`);
                    }
                    else {
                        const winningUser = spUsers[0];
                        sp.winningUsers = [winningUser];
                        game.printToLog(`Sidepot for ${sp.usernames.join(' and ')}: ${winningUser.username} wins as the last player standing`);
                    }
                });
            }
            else {
                const winningUser = liveUsers[0];
                winningUser.wonLastHand = true;
                game.printToLog(`${winningUser.username} wins as the last player standing`);
            }

            game.users.forEach(u => {
                const wonSidePot = game.sidepots.some(sp => sp.winningUsers.some(wu => wu._id === u._id));
                if (!u.eliminated) {
                    const eliminated = ((u.money === 0) && !u.wonLastHand && !wonSidePot);
                    if (eliminated) eliminate(game, u);
                }
            });

            if (game.users.filter(u => !u.eliminated).length === 1) {
                game.printToLog(`Game Over\nBig ${game.users.find(u => !u.eliminated).username} wins!`);
                game.finish();
                return null;
            }

            return {name: 'reshuffle', index: game.users.findIndex(u => u.position === 'dealer')};
        }
}

//each action will send an event/arg prompt to the client,
//then act on clients reply as specified in replyEvents
var userInputActions = {
    'reshuffle': (game, index) => {
        return {
            targetID: game.users[index]._id,
            event: 'choose',
            arg: {options: [
                {message: `Reshuffle`,
                event: 'reshuffle'}
            ]},
            replyEvents: [
                {
                    event: 'reshuffle',
                    action: () => {

                        return {
                            name: 'starthand'
                        };
                    }
                }
            ]
        }
    },
    'smallblind': (game, index) => {
        const reqAmt = Math.min(game.smallBlind, game.users[index].money);
        return {
            targetID: game.users[index]._id,
            event: 'choose',
            arg: {options: [
                {message: `Post Small Blind: ${reqAmt}`,
                event: 'bet',
                arg: reqAmt}
            ]},
            replyEvents: [
                {
                    event: 'bet',
                    action: (amt) => {
                        game.printToLog(`Small Blind: ${game.users[index].username} bets ${amt}`);
                        amt = Number(amt);
                        depositBet(game, index, amt);

                        return {
                            name: 'bigblind',
                            index: nextUInd(index, game),
                        };
                    }
                }
            ]
        }
    },
    'bigblind':  (game, index) => {
        const reqAmt = Math.min(game.bigBlind, game.users[index].money);
        return {
            targetID: game.users[index]._id,
            event: 'choose',
            arg: {options: [
                {message: `Post Big Blind: ${reqAmt}`,
                event: 'bet',
                arg: reqAmt}
            ]},
            replyEvents: [
                {
                    event: 'bet',
                    action: (amt) => {
                        game.printToLog(`Big Blind: ${game.users[index].username} bets ${amt}`);
                        amt = Number(amt);
                        depositBet(game, index, amt);

                        return {
                            name: 'bet',
                            index: nextUInd(index, game),
                            next: 'deal'
                        };
                    }
                }
            ]
        }
    },
    'bet': (game, index, next) => {
        if (index == null) {
            let dealerIndex = game.users.findIndex(u => u.position === 'dealer');
            index = game.users.filter(u => !u.eliminated).length > 2 ? nextUInd(dealerIndex, game) : dealerIndex;
        }
        const prevHighBet = Math.max(...game.users.map(u => u.bet || 0));
        let callAmt = prevHighBet - (game.users[index].bet || 0);
        callAmt = Math.min(callAmt, game.users[index].money);
        return {
            targetID: game.users[index]._id,
            event: 'bet',
            arg: {min: callAmt, max: game.users[index].money},
            replyEvents: [
                {
                    event: 'bet',
                    action: (amt) => {
                        amt = Number(amt);

                        depositBet(game, index, amt);                        

                        let message = ` bets ${amt}`;
                        if (amt === 0) message = ' checks';
                        else if (amt === callAmt) message = ' calls';
                        else if(amt > callAmt && prevHighBet > 0) message = ` raises to ${game.users[index].bet}`;
                        game.printToLog(game.users[index].username + message);

                        if (isBettingDone(game)) {
                            //clear bets
                            game.users.forEach(u => {
                                u.bet = null;
                            });
                            return {
                                name: next,
                            };
                        } else {
                            return {
                                name: 'bet',
                                index: nextUInd(index, game),
                                next
                            };
                        }

                    }
                },
                {
                    event: 'fold',
                    action: () => {
                        game.users[index].folded = true;
                        game.users[index].bet = null;
                        game.discard.push(...game.users[index].hand);
                        game.users[index].hand = [];
                        game.printToLog(`${game.users[index].username} folds`);

                        resolveSidepots(game);

                        if (game.users.filter(u => !u.folded && !u.eliminated).length === 1) {
                            //game.printToLog(`${game.users.filter(u => !u.folded)[0].username} wins as last player standing`);
                            return {name: 'endhand'};
                        }

                        if (isBettingDone(game)) {
                            //clear bets
                            game.users.forEach(u => {
                                u.bet = null;
                            });
                            return {
                                name: next,
                            };
                        } else {
                            return {
                                name: 'bet',
                                index: nextUInd(index, game),
                                next
                            };
                        }
                    }
                }
            ]
        }
    }
}

function resolveSidepots(game) {
    game.sidepots.forEach((sp, index, sidepots) => {
        const spLiveUsers = game.users.filter(u => sp.userIDs.includes(u._id) && !u.folded && !u.eliminated);
        if (spLiveUsers.length === 1) {
            const spWinner = spLiveUsers[0];
            spWinner.money += sp.pot;
            sidepots.splice(index, 1);
            game.printToLog(`Sidepot for ${sp.usernames.join(' and ')} concluded: ${spWinner.username} wins as the last player standing`);
        }
        else if (spLiveUsers.length === 0) {
            if (sp.userIDs.length === 1) {
                const spWinner = game.users.find(u => u._id === sp.userIDs[0]);
                spWinner.money += sp.pot;
                sidepots.splice(index, 1);
                game.printToLog(`Sidepot for ${sp.usernames.join(' and ')} concluded: ${spWinner.username} wins by default`);
            }
            else {
                game.pot += sp.pot;
                sidepots.splice(index, 1);
                game.printToLog(`Sidepot for ${sp.usernames.join(' and ')} concluded: nobody wins, money dumped in pot`);
            }
        }
    });
}

function depositBet(game, index, amt) {
    let sidepotsCreated = [];

    let liveUsers = game.users.filter(u => !u.folded && !u.eliminated);
    let amtsUsersCanPay = {};
    liveUsers.forEach(u => {
        amtsUsersCanPay[u._id] = u.money + u.bet - game.users[index].bet;
    });
    
    game.users[index].money -= amt;
    if (game.users[index].bet == null || game.users[index].bet == 'undefined') game.users[index].bet = 0;
    game.users[index].bet += amt;

    let minAmtEveryoneCanPay = Math.min(...Object.values(amtsUsersCanPay));
    if (minAmtEveryoneCanPay >= amt) {
        //everyone has plenty of money yay, no need to worry about sidepots
        game.pot += amt;
        return false;
    }

    let amtRemaining = amt;
    amtRemaining -= minAmtEveryoneCanPay;
    game.pot += minAmtEveryoneCanPay;
    for (const id of Object.keys(amtsUsersCanPay)) {
        amtsUsersCanPay[id] -= minAmtEveryoneCanPay;
    }
    while (amtRemaining > 0) {
        for (const [anID, anAmt] of Object.entries(amtsUsersCanPay)) {
            if (anAmt === 0) delete amtsUsersCanPay[anID];
        }
        minAmtEveryoneCanPay = Math.min(...Object.values(amtsUsersCanPay));
        let idsWhoCanPay = Object.keys(amtsUsersCanPay)
        let sidepot = game.sidepots.find(sp => JSON.stringify(sp.userIDs.sort()) === JSON.stringify(idsWhoCanPay.sort()));
        if (!sidepot) {
            sidepot = {
                pot: 0,
                userIDs: JSON.parse(JSON.stringify(idsWhoCanPay)),
                usernames: game.users.filter(u => idsWhoCanPay.includes(u._id)).map(u => u.username)
            }
            game.sidepots.push(sidepot);
            sidepotsCreated.push(sidepot);
        }
        sidepot.pot += Math.min(amtRemaining, minAmtEveryoneCanPay);
        amtRemaining -= minAmtEveryoneCanPay;
        for (const id of Object.keys(amtsUsersCanPay)) {
            amtsUsersCanPay[id] -= minAmtEveryoneCanPay;
        }
    }

    if (sidepotsCreated) {
        sidepotsCreated.forEach(sp => {
            game.printToLog(`Sidepot created for ${sp.usernames.join(' and ')}`);
        })
    }
}

function isBettingDone(game) {
    //true if all non-folded users have bet the same amt (can be 0, can't be undefined)
    //or are all in
    const liveUsers = game.users.filter(u => !u.folded && !u.eliminated);
    if (liveUsers.some(u => u.bet === null || u.bet === 'undefined')) {
        return false;
    }
    if (liveUsers.length > 0) {
        const highBet = Math.max(...liveUsers.map(u => u.bet));
        if(liveUsers.some(u => u.bet !== highBet && u.money > 0)) return false;
    }
    return true;
}

function nextUInd(ind, game) {
    do {
        ind = (ind + 1) % game.users.length;
    } while(game.users[ind].eliminated || game.users[ind].folded || game.users.money == 0)
    return ind;
}

function gameChanged(game) {
    game.users.forEach(u => {
        game.emitByUID(u._id, 'game changed', {game: game.getUserView(u._id)});
    });
}

function concealHands(game, userID) {
    if (game.handsRevealed) return game;
    game = JSON.parse(JSON.stringify(game));//structuredClone(game);
    game.users.forEach(u => {
        if (u._id !== userID) {
            for (let i = 0; i < u.hand.length; i++) {
                u.hand[i] = '-';
            }
        }
    });
    return game;
}

function getAllCombos(anArray, num) {
    if (num <= 1) {
        return anArray.map(el => [el]);
    }
    if (num > anArray.length) {
        return [];
    }

    if (num > anArray.length/2) {
        let combos = getAllCombos(anArray, anArray.length - num);
        return combos.map(c => anArray.filter(el => !c.includes(el)));
    }

    let combos = [];
    anArray.forEach((el, ind) => {
        let subArray = anArray.slice(ind+1);
        let subCombos = getAllCombos(subArray, num-1);
        subCombos.forEach(sc => {
            combos.push([el, ...sc]);
        });
    })
    return combos;
}

function buildWinningUsersMsg(winningUsers, decTBRank) {
    const winningHandScores = winningUsers.map(u => scoreHand(u.bestHand));
    const winningHandDesc = `${winningHandScores[0].category}${winningHandScores[0].desc}`;

    let msg = '';
    if (winningUsers.length === 1) {
        let winningUser = winningUsers[0];
        msg = `${winningUser.username} wins with ${winningHandDesc}`;
        if (decTBRank) {
            msg += ` (tiebreak: ${ranksLong[decTBRank]} high)`;
        }
    }
    else if (winningUsers.length > 1) {
        const names = winningUsers.map(u => u.username).join(' and ');
        msg = `${names} tied with ${winningHandDesc} `;
        if (decTBRank) {
            msg += ` (tiebreak: ${ranksLong[decTBRank]} high)`;
        }
    }
    else {
        msg = 'uh oh, nobody won this hand';
    }
    return msg;
}

function assignPlaces(users) {
    let place = 1;
    let decTBRank = null;
    while (users.length > 0) {
        let {winningUsers, aDecTBRank} = getWinningUsers(users);
        if (place === 1) decTBRank = aDecTBRank;
        winningUsers.forEach(w => {
            w.placeLastHand = place;
            users = users.filter(u => u._id !== w._id);
        });
        place++;
    }
    return decTBRank;
}

/*let placingUsers = [];
if (liveUsers.length > 1) {
    let {winningUsers, decTBRank} = getWinningUsers(liveUsers);
    const winMsg = buildWinningUsersMsg(winningUsers, decTBRank);
    if (place === 1) game.printToLog(winMsg);
    placingUsers = [...winningUsers];
}
else {
    let winningUser = liveUsers[0];
    placingUsers = [winningUser];
    winningUser.placeLastHand = 1;
    if (place === 1) game.printToLog(`${winningUser.username} wins as last player standing`);
}
placingUsers.forEach(u => u.placeLastHand = place);
place++;
liveUsers = liveUsers.filter(u => !placingUsers.includes(u));*/

function getWinningUsers(users) {
    users.sort((u1, u2) => compareHands(u1.bestHand, u2.bestHand));
    let tiedResults = [users[users.length-1]];
    let i = users.length-1;
    while (i > 0 && compareHands(users[i].bestHand, users[i-1].bestHand) === 0) {
        tiedResults.push(users[i-1]);
        i--;
    }
    let decTBRank = null;
    if (i > 0 && compareHands(users[i].bestHand, users[i-1].bestHand, false) === 0) {
        //an extra card tiebreak was used
        decTBRank = getDecisiveExtraCardTBRank(users[i].bestHand, users[i-1].bestHand);
    }
    return {winningUsers: tiedResults, decTBRank};
}

function getHighHands(hands) {
    hands = JSON.parse(JSON.stringify(hands));
    hands.sort((h1, h2) => compareHands(h1, h2));
    let tiedResults = [hands[hands.length-1]];
    let i = hands.length-1;
    while (i > 0 && compareHands(hands[i], hands[i-1]) === 0) {
        tiedResults.push(hands[i-1]);
        i--;
    }
    return tiedResults;
}

function compareHands(h1, h2, useExtraCardTiebreaks=true) {
    let s1 = scoreHand(h1);
    let s2 = scoreHand(h2);
    if (s1.categoryScore !== s2.categoryScore) return s2.categoryScore - s1.categoryScore; //lower is better!
    if(useExtraCardTiebreaks) {
        s1.tiebreakRanks = [...s1.usefulCardRanks, ...s1.extraCardRanks];
        s2.tiebreakRanks = [...s2.usefulCardRanks, ...s2.extraCardRanks];
    }
    else {
        s1.tiebreakRanks = [...s1.usefulCardRanks];
        s2.tiebreakRanks = [...s2.usefulCardRanks];
    }
    let i = 0;
    while(i < s1.tiebreakRanks.length && i < s2.tiebreakRanks.length) {
        if (s1.tiebreakRanks[i] !== s2.tiebreakRanks[i]) return s1.tiebreakRanks[i] - s2.tiebreakRanks[i];
        i++;
    }
    return 0;
}

function getDecisiveExtraCardTBRank(h1, h2) {
    let s1 = scoreHand(h1);
    let s2 = scoreHand(h2);
    if (s1.categoryScore !== s2.categoryScore) return null; //lower is better!    
    let i = 0;
    s1.tiebreakRanks = s1.extraCardRanks;
    s2.tiebreakRanks = s2.extraCardRanks;
    while(i < s1.tiebreakRanks.length && i < s2.tiebreakRanks.length) {
        if (s1.tiebreakRanks[i] !== s2.tiebreakRanks[i]) return Math.max(s1.tiebreakRanks[i], s2.tiebreakRanks[i]);
        i++;
    }
    return null;
}

function scoreHand(hand) {
    hand = hand.map(c => {
        return {
            rank: c.substring(0, c.length-1),
            suit: suitsLong[suits.indexOf(c.substring(c.length-1))]
        }
    });
    let rankQuantities = ranks.map(r => hand.filter(c => c.rank == r).length);

    let category = 'High Card';
    let desc = ` ${ranksLong[rankQuantities.lastIndexOf(1)]}`;
    if (rankQuantities.includes(4)) {
        category = 'Four of a Kind';
        desc = ` ${ranksLong[rankQuantities.indexOf(4)]}s`;
    }
    else if(rankQuantities.includes(3) && rankQuantities.includes(2)) {
        category = 'Full House';
        desc = `, ${ranksLong[rankQuantities.indexOf(3)]}s and ${ranksLong[rankQuantities.indexOf(2)]}s`;
    }
    else if(rankQuantities.includes(3)) {
        category = 'Three of a Kind';
        desc = ` ${ranksLong[rankQuantities.indexOf(3)]}s`;
    }
    else if(rankQuantities.filter(q => q===2).length === 2) {
        category = 'Two Pair';
        desc = `, ${ranksLong[rankQuantities.lastIndexOf(2)]}s and ${ranksLong[rankQuantities.indexOf(2)]}s`;
    }
    else if(rankQuantities.includes(2)) {
        category = 'Pair';
        desc = ` of ${ranksLong[rankQuantities.indexOf(2)]}s`;
    }
    else {
        let rankQuantitiesForStraight = rankQuantities;
        let acesLow = false;
        if (rankQuantitiesForStraight[0] > 0) {
            //if there is a 2 in the hand, count aces as low, and DON'T count them as high for straights
            acesLow = true;
            rankQuantitiesForStraight = [hand.filter(c => c.rank == 'A').length, ...rankQuantities.slice(0, rankQuantities.length-1)];
        }
        const straight = rankQuantitiesForStraight.join(',').includes('1,1,1,1,1');
        const flush = hand.map(c => c.suit).every(s => s === hand[0].suit);
        if (straight && flush) {
            category = 'Straight Flush';
            desc = ` of ${hand[0].suit}s, ${ranksLong[rankQuantitiesForStraight.lastIndexOf(1) - (acesLow ? 1 : 0)]} high`;
            if (desc.includes('Ace high')) {
                category = 'Royal Flush';
                desc = ` of ${hand[0].suit}s`;
            }
        }
        else if (straight) {
            category = 'Straight';
            desc = `, ${ranksLong[rankQuantitiesForStraight.lastIndexOf(1) - (acesLow ? 1 : 0)]} high`;
        }
        else if (flush) {
            category = 'Flush';
            desc = ` of ${hand[0].suit}s`;
        }
    }

    const usefulQuants = [4, 3, 2];
    let usefulCardRanks = []
    usefulQuants.forEach(q => {
        let ind = rankQuantities.length-1;
        do {
            ind = rankQuantities.lastIndexOf(q, ind);
            if (ind !== -1) {
                usefulCardRanks.push(ind);
                ind--;
            }
        }
        while (ind >= 0);
    });
    let extraCardRanks = []
    let ind = rankQuantities.length-1;
    do {
        ind = rankQuantities.lastIndexOf(1, ind);
        if (ind !== -1) {
            extraCardRanks.push(ind);
            ind--;
        }
    }
    while (ind >= 0);

    if (category === 'High Card' || category.includes('Straight')) {
        //in these cases the (highest) high card is considered useful
        usefulCardRanks.push(extraCardRanks.shift());
    }

    if (category.includes('Straight') && hand.some(c => c.rank === 'A') && hand.some(c => c.rank === '2')) {
        //shamelessly hardcoded edge case to ensure ace-low straights count the ace as low for tiebreaking
        usefulCardRanks = [3]
        extraCardRanks = [2, 1, 0, -1];
    }
    const categoryRanking = ['Straight Flush', 'Four of a Kind', 'Full House', 'Flush', 'Straight', 'Three of a Kind', 'Two Pair', 'Pair', 'High Card'];
    return {
        category,
        desc,
        categoryScore: categoryRanking.indexOf(category),
        usefulCardRanks, //ranks of the pair/two pair/etc, in desc order, for tiebreaking
        extraCardRanks  //ranks of the extra cards in desc order, for tiebreaking
    }
}