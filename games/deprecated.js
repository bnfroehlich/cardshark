/*
            else {
                //otherwise...
                console.log('bets: ' + JSON.stringify(game.users.map(u => u.totalBetThisHand)));
                let currentPlace = 1;
                const numLiveUsers = game.users.filter(u => !u.folded && !u.eliminated).length;
                while (currentPlace <= numLiveUsers && game.pot > 0 && game.pot >= game.users.filter(u => u.placeLastHand === currentPlace).length) {
                    console.log('awarding pots');
                    //side pots
                    let winners = game.users.filter(u => u.placeLastHand === currentPlace);
                    let amtsEligibleFor = []
                    winners.forEach(w => {
                        //each winner can win at most their own bet from each other player
                        const stakesPerPlayer = game.users.map(u => Math.min(u.totalBetThisHand, w.totalBetThisHand));
                        console.log('stakesPerPlayer: ' + JSON.stringify(stakesPerPlayer));
                        w.amtEligibleFor = stakesPerPlayer.reduce((partialSum, a) => partialSum + a, 0);
                        amtsEligibleFor.push(w.amtEligibleFor);
                    });
                    amtsEligibleFor.sort();
                    console.log('amtsElibigleFor: ' + JSON.stringify(amtsEligibleFor));
                    amtsEligibleFor.forEach(amt => {
                        //for each subpot that a winner is eligible for, in ascending order by subpot size,
                        //split that amount among all winners, then reduce each winner's amtEligibleFor by the full amount
                        const share = Math.floor(amt/winners.length);
                        winners.forEach(w => {
                            w.money += share;
                            game.pot -= share;
                            console.log(`giving ${share} to ${w.username}`);
                            w.amtEligibleFor -= amt;
                        });
                        winners = winners.filter(w => w.amtEligibleFor > 0);
                    });
                    currentPlace++;
                    //then, recursively divide the remaining pot among lower-placing players in the same way
                }
            }

    */