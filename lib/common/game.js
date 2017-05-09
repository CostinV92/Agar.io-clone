var Player = require('./player.js');
var Pair = require('number-pairings').Cantor;

var Game = function(socket) {

    // the Player instace for which this game instance is intended
    // on server this will be null
    if (socket)
        this.player = new Player(socket, 0, Game.width, Game.height);
    else
        player = null;

    // all the players in the game {name: Player}
    // on the client the players fields will not be instances of Player
    this.players = {};

    // keep the food at a normal amount level
    this.foodAmount = 0;
    this.food = {};

    // messages to send to the clients {message: data} (including socket)
    this.messagesToSend = {};

    // messages to process = {message: data} (including socket)
    this.messagesToProcess = {};

    // for drawing
    this.canvas = null;

    Game.Instance = this;
}

// main game loop


var gameLoop = function() {
    var game = Game.getInstance();
    game.processMessages();
    game.sendMessages();

    if(!game.getPlayer())
        game.generateFood();

    if(game.getPlayer() && Game.ready) {
        // i run on client so i do client jobs
        game.getPlayer().sendUpdatePlayer(Game.getInstance().food, Game.getInstance().players);
        game.clearCanvas();
        game.drawFood();
        game.drawPlayer();
        game.drawOtherPlayers();
    }
}

Game.prototype.run = function () {
    this.running = setInterval(function(){
                    gameLoop();
                }, 20);
}

Game.prototype.setPlayer = function(player) {
    this.player = player;
}

Game.prototype.getPlayer = function(playerName) {
    if(playerName)
        return this.players[playerName];

    return this.player;
}

Game.prototype.setFood = function(food) {
    for(it in food) {
        this.food[it] = food[it];
        this.foodAmount++;
    }
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
        position.x = Math.floor(Math.random() * Game.width - 50 + 1);
        position.y = Math.floor(Math.random() * Game.height - 50 + 1);

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
        console.log('delete_player: ' + playerName);
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
                var playerr = this.getPlayer(it);
                players[it] = {
                    'name': playerr.name,
                    'pos' : playerr.pos,
                    'mass': playerr.mass
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
        Game.ready = true;
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
                break;
        }

        delete this.messagesToProcess[key];
    }
}

Game.prototype.processUpdatePlayer = function(data) {
    if(data) {
        var player = this.getPlayer(data.name);
        // the player has not registered yet
        if (!player)
            return;
        player.pos = data.pos;
        player.mass = data.mass;
        this.eatenFood(data.eatenFood);

        // only if we are on the server
        if(!this.player) {
            this.eatenPlayers(data.eatenPlayers);
            var socket = player.socket;
            socket.broadcast.emit('update_player', data);
        }
    }
}

Game.prototype.clearCanvas = function() {
    var context = this.canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '20px Courier New';
    context.fillText('Food Eaten: ' + ((this.getPlayer().mass - 10) / 0.5), 10,20);
    context.fillText('Number of players: ' + (Object.keys(this.players).length + 1), 10, 40)
    context.fillText('x: ' + Math.floor(this.getPlayer().pos.x), 10, 60);
    context.fillText('y: ' + Math.floor(this.getPlayer().pos.y), 10, 80);
}

Game.prototype.drawPlayer = function() {
    var player = this.player;

    if(player) {
        var context = this.canvas.getContext('2d');
        context.beginPath();
        context.arc(player.pos.x - player.posV.x, player.pos.y - player.posV.y, player.mass, 0,2*Math.PI);
        context.stroke();
        context.font = '20px Courier New';
        context.fillText(player.name, player.pos.x - player.posV.x - (player.name.length * 13) / 2, player.pos.y - player.posV.y + 3);
    }
}

Game.prototype.drawOtherPlayers = function() {
    var player = this.getPlayer();
    var players = this.players;
    var context = this.canvas.getContext('2d');
    for(it in players) {
        context.beginPath();
        context.arc(players[it].pos.x - player.posV.x, players[it].pos.y - player.posV.y, players[it].mass, 0,2*Math.PI);
        context.stroke();
        context.font = '20px Courier New';
        context.fillText(players[it].name, players[it].pos.x - player.posV.x - (players[it].name.length * 13) / 2, players[it].pos.y - player.posV.y + 3);
    }
}

Game.prototype.drawFood = function() {
    var context = this.canvas.getContext('2d');
    for(it in this.food) {
        context.beginPath();
        context.arc(this.food[it].x - this.getPlayer().posV.x, this.food[it].y - this.getPlayer().posV.y, 3, 0,2*Math.PI);
        context.stroke();
    }
}

Game.prototype.generateFood = function() {
    var x, y;
    var cantorNumber;
    var newFood = {};

    for(i = this.foodAmount; i < Game.MAX_FOOD; i++) {
        do {
            x = Math.floor((Math.random() * (Game.width)) + 10);
            y = Math.floor((Math.random() * (Game.height)) + 10);
            cantorNumber = Pair.z(x, y);
        } while(this.food[cantorNumber] || newFood[cantorNumber]);

        this.foodAmount++;
        this.food[cantorNumber] = {x: x, y: y, mass: 3};
        newFood[cantorNumber] = {x: x, y: y, masss: 3};
    }

    //this.io.sockets.emit('food', this.food);
    for(it in this.players) {
        this.players[it].socket.emit('food', newFood);
    }
}

Game.prototype.eatenFood = function(food) {
    for(it in food) {
        delete this.food[it];
        this.foodAmount--;
    }
}

Game.prototype.eatenPlayers = function(players) {
    if(this.player)
        return;
    for(it in players) {
        this.players[it].socket.emit('looser');
        this.processUnregister(this.players[it].socket);
        console.log('LOOOOOOSER: ' + it);
    }
}

Game.prototype.lost = function() {
    var context = this.canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '20px Courier New';
    context.fillText('YOU LOST!', window.innerWidth / 2 - 50, window.innerHeight / 2);
    Game.ready = false;
    clearInterval(this.running);
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
Game.ready = false;
Game.width = 5000;
Game.height = 5000;
Game.MAX_FOOD = 3000;
module.exports = Game;
