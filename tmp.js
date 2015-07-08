
  return _.reduce(line, function(score, tile, index) {
    if(self.game.board[tile[0]][tile[1]] == self.symbol) {
      if(score > 0) {
        return score *= 10; //cell1 and/or cell2 is this.symbol
      }
      else if (score < 0) {  // cell1 and/or cell2 is opponent symbol
        return 0;
      } else {  // cell1 and cell2 are empty
        return 1;
      }
    }
    else if (self.game.board[tile[0]][tile[1]] === self.opponents[0].symbol) {
       if (score < 0) {  // cell1 and/or cell2 is opponent symbol
        return score *= 10;
      } else if (score > 1) {  // cell1 and/or cell2 is this.symbol
        return 0;
      } else {  // cell1 and cell2 are empty
        return -1;
      }
    }
    else return score;
  },0);
