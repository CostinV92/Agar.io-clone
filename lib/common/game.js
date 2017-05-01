var Player = require('./player.js');

var Game = function(socket) {

    // the Player instace for which this game instance is intended
    // on server this will be null
    if (socket)
        this.player = new Player(socket, 0, 0);

    // all the players in the game {name: Player}
    this.players = {};

    this.food = {};

    Game.Instance = this;
}

Game.prototype.setPlayer = function(player) {
    this.player = player;
}

Game.prototype.addPlayer = function(player) {
    this.players[player.name] = player;
}

Game.prototype.removePlayer = function(name) {
    if (name)
        delete this.players[name];
}

Game.getInstance = function () {
    if (!Game.Instance)
        return new Game();

    return Game.Instance;
}

module.exports = Game;