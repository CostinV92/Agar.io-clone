var Game = require('./common/game.js');
var Player = require('./common/player.js');

module.exports = function (http) {
    var io = require('socket.io')(http);

    io.on('connection', function(socket) {
        console.log('client conected');
        socket.broadcast.emit('message', 'client conected');

        socket.on('register', function(name) {
            if(socket.name)
                // already registered
                return;

            // save the name to easily find the player
            // in case the connection goes down
            socket.name = name;

            // create a new Player instance and add it to the game
            var gameInstance = Game.getInstance();
            gameInstance.addPlayer(new Player(socket));

            console.log('user ' + name + ' registered');

            socket.emit('registered', 'You\'ve been registered!');
        });

        socket.on('disconnect', function() {
            // if it was a registered player unregister it
            if (socket.name) {
                var gameInstance = Game.getInstance();
                gameInstance.removePlayer(socket.name);
                console.log('user ' + socket.name + ' unregistered');
            }

            socket.broadcast.emit('message', 'client disconnected');
            console.log('user disconnected');
        });
    });
};