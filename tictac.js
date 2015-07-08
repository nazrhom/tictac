var prompt = require('prompt');
var _ =      require('lodash');
var Game =   require('./game');

var tic = new Game();

p1 = {role: 'human', symbol: 'X', name: 'Player1'};
p2 = {role: 'ai', symbol: 'O', name: 'Player2'};

p1 = tic.addPlayer(p1);

p2 = tic.addPlayer(p2);

var DEPTH_LEVEL = 4;
// p1.move('00');
// p2.move('01');
// p2.move('02');
// console.log(p1.evaluateLine(0,0,0,1,0,2));
//
// Start the prompt
//
prompt.start();

function endGame() {
  console.log();
  if(tic.tie) {
    console.log('Game is a draw!')
  }
  else {
    console.log('Winner is: ' + tic.winner.name);
  }
  tic.printBoard();
}

(function turn(){
  tic.printBoard();
  prompt.get(['move'], function (err, result) {
    if(err) {
      return;
    }


    if(p1.move(result.move)) {
      if(!tic.isOver()) {
        var nextmove = p2.minmax(DEPTH_LEVEL);
        p2.move([nextmove.bestRow, nextmove.bestCol]);
        if(!tic.isOver()){
          turn();
        }
        else endGame();
      }
      else endGame();
    }
    else turn();
  });
})();



// Notation

//             0  1  2
//           A X  .  O
//                            A0 A1 A2 B0 B1 B2 C0 C1 C2
//           B X  O  .    =          X.OXO.O..
//
//           C O  .  .
