var _ = require('lodash');
var util = require('util');



var Player = function(config) {
  this.role = config.role;
  this.symbol = config.symbol;
  this.name = config.name;
  this.game = config.game;
  this.opponents = config.opponents;

  var self = this;
  this.game.on('error', function(error) {
    console.log(error);
  });

  this.game.on('new player', function(player) {
    self.addOpponent(player);
  });

  this.game.on('illegal move', function(player) {
    if(player === self) {
      console.log(player.name + ': This is not a valid move!\nPlease retry.\n');
    }
  })
}

Player.prototype.generateMoves = function(player) {
  if(_.isUndefined(player)) {
    player = this;
  }

  var movesArray = [];
  if(this.game.isOver()) {
    return movesArray;
  }

  for(var row = 0; row < this.game.board.length; row++) {
    for(var col = 0; col < this.game.board[0].length; col++) {
      if(this.game.board[row][col] === this.game.emptySymbol) {
        movesArray.push({symbol: player.symbol, position: [row,col]});
      }
    }
  }
  return movesArray;
}

Player.prototype.minmax = function(depth, player, alpha, beta) {
  if(_.isUndefined(player)) {
    player = this
  }
  if(_.isUndefined(alpha)) {
    alpha = -Number.MAX_VALUE;
  }
  if(_.isUndefined(beta)) {
    beta = Number.MAX_VALUE;
  }

  var nextMoves = this.generateMoves(player.symbol);

  var score;
  var bestRow = -1;
  var bestCol = -1;
  if(depth === 0 || _.isEmpty(nextMoves)) {
    score = this.evaluate();
    return {score: score, bestRow: bestRow, bestCol: bestCol};

  }
  else {
    for(var i = 0; i < nextMoves.length; i++) {
      var position = nextMoves[i].position;
      this.game.move(player, [position[0], position[1]]);

      if(player.symbol == this.symbol) {
        score = this.minmax(depth - 1, player.opponents[0], alpha, beta).score;
        if(score > alpha) {
          alpha = score;
          bestRow = position[0];
          bestCol = position[1];
        }
      }
      else {
        score = this.minmax(depth - 1, this, alpha, beta).score;
        if(score < beta) {
          beta = score;
          bestRow = position[0];
          bestCol = position[1];
        }
      }
      this.game.undoMove();

      if(alpha >= beta) break;
    }
  }

  return {score: (player === this) ? alpha : beta, bestRow: bestRow, bestCol: bestCol};
}

Player.prototype.move = function(pos) {
  var moveResult = this.game.move(this, pos);
  this.game.checkTie();
  return moveResult;
}

Player.prototype.addOpponent = function(player) {
  if(player !== this) {
    this.opponents.push(player);
  }
}

Player.prototype.evaluate = function() {
  var self = this;

  return _.reduce(this.game.lines, function(score, line) {
    return score + self.evaluateLine.apply(self, _.flatten(line));
  }, 0);


}

Player.prototype.evaluateLine = function(row1, col1, row2, col2, row3, col3) {
  var score = 0

    //
    // var arg = [[row1, col1],[row2,col2],[row3, col3]];
    // var self = this;
    // var newScore = _.reduce(arg, function(score, tile, index) {
    //   var value = 1;
    //   if(self.game.board[tile[0]][tile[1]] === self.symbol) {
    //     if(score > 0) {
    //       value = 10;
    //     }
    //     else if (score < 0) {  // cell1 and/or cell2 is self.opponents[0].symbol
    //       value = 0;
    //     } else {  // cell1 and cell2 are empty
    //       value = 1;
    //     }
    //   }
    //   else if (self.game.board[tile[0]][tile[1]] === self.opponents[0].symbol) {
    //     if (score < 0) {  // cell1 and/or cell2 is this.
    //       value = 10;
    //     }
    //     else if (score >= 1) {  // cell1 and/or cell2 is this.symbol
    //       value = 0;
    //     } else {  // cell1 and cell2 are empty
    //       value = -1;
    //     }
    //   }
    //   return score * value;
    // },0);
    //
    // console.log(arg);
    // this.game.printBoard();
    // console.log('New score is ', newScore);

  // First cell
  if (this.game.board[row1][col1] === this.symbol) {
     score = 1;
  } else if (this.game.board[row1][col1] === this.opponents[0].symbol) {
     score = -1;
  }

  // Second cell
  if (this.game.board[row2][col2] === this.symbol) {
     if (score === 1) {   // cell1 is this.symbol
        score = 10;
     } else if (score === -1) {  // cell1 is this.opponents[0].symbol
        return 0;
     } else {  // cell1 is empty
        score = 1;
     }
  } else if (this.game.board[row2][col2] === this.opponents[0].symbol) {
     if (score === -1) { // cell1 is this.opponents[0].symbol
        score = -10;
     } else if (score === 1) { // cell1 is this.symbol
        return 0;
     } else {  // cell1 is empty
        score = -1;
     }
  }

  // Third cell
  if (this.game.board[row3][col3] === this.symbol) {
     if (score > 0) {  // cell1 and/or cell2 is this.symbol
        score *= 10;
     } else if (score < 0) {  // cell1 and/or cell2 is this.opponents[0].symbol
        return 0;
     } else {  // cell1 and cell2 are empty
        score = 1;
     }
  } else if (this.game.board[row3][col3] === this.opponents[0].symbol) {
     if (score < 0) {  // cell1 and/or cell2 is this.
        score *= 10;
     } else if (score > 1) {  // cell1 and/or cell2 is this.symbol
        return 0;
     } else {  // cell1 and cell2 are empty
        score = -1;
     }
  }




  return score;


}


module.exports = Player;
