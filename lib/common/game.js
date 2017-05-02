var Player = require('./player.js');

var Game = function(socket) {

    // the Player instace for which this game instance is intended
    // on server this will be null
    if (socket)
        this.player = new Player(socket, 0, 0);

    // all the players in the game {name: Player}
    // on the client the players fields will not be instances of Player
    this.players = {};

    this.food = {};

    // messages to send to the clients {message: data} (including socket)
    this.messagesToSend = {};

    // messages to process = {message: data} (including socket)
    this.messagesToProcess = {};

    Game.Instance = this;
}

// main game loop


var gameLoop = function() {
    var game = Game.getInstance();
    game.processMessages();
    game.sendMessages();
}

Game.prototype.run = function () {
    setInterval(function(){
                    gameLoop();
                }, 300);
}

Game.prototype.setPlayer = function(player) {
    this.player = player;
}

Game.prototype.getPlayer = function(playerName) {
    if(playerName)
        return this.players[playerName];

    return this.player;
}

Game.prototype.addPlayer = function(player) {
    this.players[player.name] = player;
}

Game.prototype.removePlayer = function(name) {
    if (name)
        delete this.players[name];
}

Game.prototype.addMessageToSend = function(message, data) {
    this.messagesToSend[message] = data;
}

Game.prototype.addMessageToProcess = function(message, data) {
    this.messagesToProcess[message] = data;
}

Game.prototype.sendNewPlayer = function(playerName) {
    if(playerName) {
        var player = this.players[playerName];
        var socket = player.socket;
        var toSend = {
            'name': this.players[playerName].name,
            'posX': this.players[playerName].posX,
            'posY': this.players[playerName].posY,
            'mass': this.players[playerName].mass
        }

        socket.broadcast.emit('new_player', toSend);
        console.log('sent new_player');
    }
}

Game.prototype.processNewPlayer = function(player) {
    if(player) {
        this.addPlayer(player);
        console.log('processed new_player');
    }
}

Game.prototype.sendRegister = function(player) {
    if(player) {
        var socket = player.socket;
        socket.emit('register', player.name);
        console.log('sent register');
    }
}

Game.prototype.processRegister = function(socket) {
    if(socket) {
        var player = new Player(socket);
        this.addPlayer(player);
        // sends the game instance to the new registered player
        this.addMessageToSend('registered', player.name);
        // this message sends to all other players in the game the new player
        this.addMessageToSend('new_player', player.name);
    }
}

Game.prototype.processUnregister = function(socket) {
    if(socket) {
        this.removePlayer(socket.name);

        // send a message to all the clients to delete this player
        this.addMessageToSend('delete_player', socket);
    }
}

Game.prototype.sendDeletePlayer = function(socket) {
    if(socket) {
        socket.broadcast.emit('delete_player', socket.name);
    }
}

Game.prototype.processDeletePlayer = function(playerName) {
    if(playerName) {
        delete this.players[playerName];
    }
}

Game.prototype.sendRegistered = function(playerName) {
    if(playerName) {
        var player = this.players[playerName];
        var socket = player.socket;
        var food = this.food;
        var players = {};

        for (it in this.players) {
            if (it != playerName)
                players[it] = {
                    'name': this.players[it].name,
                    'posX': this.players[it].posX,
                    'posY': this.players[it].posY,
                    'mass': this.players[it].mass
                };
        }

        socket.emit('registered', {'players': players, 'food':food});
        console.log('sent registered');
    }
}

Game.prototype.processRegistered = function(gameData) {
    if(gameData) {
        var players = gameData.players;
        var food = gameData.food;

        this.players = players;
        this.food = food;
    }
}

Game.prototype.sendMessages = function () {
    for(key in this.messagesToSend) {
        var data = this.messagesToSend[key];
        console.log('Send message: ' + key + ' data: ' + data);

        switch (key) {
            case 'new_player':
                this.sendNewPlayer(data);
                break;
            case 'register':
                this.sendRegister(data);
                break;
            case 'registered':
                this.sendRegistered(data);
                break;
            case 'delete_player':
                this.sendDeletePlayer(data);
                break;
        }

        delete this.messagesToSend[key];
    }
}

Game.prototype.processMessages = function () {
    for(key in this.messagesToProcess) {
        var data = this.messagesToProcess[key];
        console.log('Process message: ' + key + ' data: ' + data);

        switch (key) {
            case 'new_player':
                this.processNewPlayer(data);
                break;
            case 'register':
                this.processRegister(data);
                break;
            case 'registered':
                this.processRegistered(data);
                break;
            case 'delete_player':
                this.processDeletePlayer(data);
                break;
            case 'unregister':
                this.processUnregister(data);
        }

        delete this.messagesToProcess[key];
    }
}

Game.getInstance = function (socket) {
    if (!Game.Instance) {
        if(!socket)
            return new Game();
        else
            return new Game(socket);
    }

    return Game.Instance;
}

Game.instance = null;
module.exports = Game;
