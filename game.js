(function() {
var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Player = require('./player');

var makeBoard = function(rows, cols, emptySymbol) {
  return board = _.range(rows).map(function() {
    return _.range(cols).map(function() {
      return emptySymbol;
    });
  });
}

var buildConfig = function(config) {
  var defConfig = {
    players: 2,
    board: {
      rows: 3,
      cols: 3,
      emptySymbol: '.'
    }
  }
  return _.merge(defConfig, config);
}

var isNumeric = function(input) {
  return (!_.isNaN(input) && _.isNumber(input));
}

var getLines = function() {
  var col1 = [[0,0], [0,1], [0,2]];
  var col2 = [[1,0], [1,1], [1,2]];
  var col3 = [[2,0], [2,1], [2,2]];
  var row1 = [[0,0], [1,0], [2,0]];
  var row2 = [[0,1], [1,1], [2,1]];
  var row3 = [[0,2], [1,2], [2,2]];
  var diag1 = [[0,0], [1,1], [2,2]];
  var diag2 = [[0,2], [1,1], [2,0]];

  return [col1, col2, col3, row1, row2, row3, diag1, diag2];
}

var Game = function(config) {
  config = buildConfig(config);

  this._players = [];
  this.moves = [];
  this.winner;
  this.tie;

  this.emptySymbol = config.board.emptySymbol
  this.board = makeBoard(config.board.rows, config.board.cols, config.board.emptySymbol);

  this.lines = getLines();

}
util.inherits(Game, EventEmitter);

Game.prototype.printBoard = function() {
  console.log();
  for(var i = 0; i < this.board.length; i++) {
    var row = this.board[i];
    console.log(row);
  }
  console.log();
}

Game.prototype.hasWon = function(player) {
  var self = this;
  var symbol = player.symbol;
  for(var i = 0; i < this.lines.length; i++) {
    var line = this.lines[i];
    line = _.map(line, function(pos) { return self.board[pos[0]][pos[1]] });

    if(line.join('') === symbol + symbol + symbol) {
      return true;
    }
  }

  return false;
}

Game.prototype.addPlayer = function(player) {
  player.game = this;
  player.opponents = _.clone(this._players);

  var newPlayer = new Player(player);
  this._players.push(newPlayer);
  this.emit('new player', newPlayer);

  return newPlayer;
}

Game.prototype.getPlayers = function() {
  return this._players;
}

Game.prototype.isOver = function() {
  if(this.tie) return true;
  for(var i = 0; i < this._players.length; i++) {
    var player = this._players[i];
    if(this.hasWon(player)) {
      this.winner = player;
      return true;
    }
  }
  return false;
}

Game.prototype.checkTie = function() {
  for(var row = 0; row < this.board.length; row++) {
    for(var col = 0; col < this.board[0].length; col++) {
      if(this.board[row][col] === this.emptySymbol) {
        return false;
      }
    }
  }

  this.tie = true;
  this.emit('tie');
  return true;

}


Game.prototype.move = function(player, position) {
  var row = parseInt(position[0]);
  var col = parseInt(position[1]);
  if(!isNumeric(row) || !isNumeric(col) || row >= this.board.length ||
      col >= this.board[0].length || this.board[row][col] !== this.emptySymbol) {
    this.emit('illegal move', player);
    return false;
  }

  else {
    this.board[row][col] = player.symbol;
  }
  this.moves.push({player: player, position: position});
  this.emit('move', {player: player, position: position});

  return true;
}



Game.prototype.undoMove = function() {
  var move = this.moves.pop();

  var row = move.position[0];
  var col = move.position[1];
  this.board[row][col] = this.emptySymbol;
}

module.exports = Game;
})();
