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

    // map dimensions
    this.X = 10000;
    this.Y = 10000;

    // for drawing
    this.canvas = null;

    // boolean for knowing if we are registered
    this.ready = false;

    Game.Instance = this;
}

// main game loop


var gameLoop = function() {
    var game = Game.Instance;
    game.processMessages();
    game.sendMessages();

    if(game.player && game.ready) {
        // i run on client so draw;
        game.clearCanvas();
        game.drawPlayer();
        game.drawOtherPlayers();
    }
}

Game.prototype.run = function () {
    setInterval(function(){
                    gameLoop();
                }, 30);
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

Game.prototype.addCanvas = function(canvas) {
    this.canvas = canvas;
}

Game.prototype.getCanvas = function() {
    return this.canvas;
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
            'name': player.name,
            'pos' : player.pos,
            'mass': player.mass
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
        var position = {};
        // TODO for testing purpose use just window size for now
        // playerName.x/y are temporary window size
        position.x = Math.floor(Math.random() * 966-50 + 1);
        position.y = Math.floor(Math.random() * 808-50 + 1);

        var player = new Player(socket, position);

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
            if (it != playerName) {
                var player = this.getPlayer(it);
                players[it] = {
                    'name': player.name,
                    'pos' : player.pos,
                    'mass': player.mass
                };
            }
        }

        socket.emit('registered', {'players': players, 'food':food, 'position': player.pos});
        console.log('sent registered');
    }
}

Game.prototype.processRegistered = function(gameData) {
    if(gameData) {
        var players = gameData.players;
        var food = gameData.food;

        this.players = players;
        this.food = food;
        this.player.setPos(gameData.position);
        this.ready = true;
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

Game.prototype.clearCanvas = function() {
    var context = this.canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}

Game.prototype.drawPlayer = function() {
    var player = this.player;
    var context = this.canvas.getContext('2d');
    context.beginPath();
    context.arc(player.pos.x, player.pos.y, player.mass, 0,2*Math.PI);
    context.stroke();
}

Game.prototype.drawOtherPlayers = function() {
    var players = this.players;
    var context = this.canvas.getContext('2d');
    for(it in players) {
        console.log(it);
        context.beginPath();
        context.arc(players[it].pos.x, players[it].pos.y, players[it].mass, 0,2*Math.PI);
        context.stroke();
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
