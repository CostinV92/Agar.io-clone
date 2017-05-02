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

            // Don't change the game right now to not break the iteration
            gameInstance.addMessageToProcess('register', socket);

            console.log('user ' + name + ' registered');
        });

        socket.on('disconnect', function() {
            // if it was a registered player unregister it
            if (socket.name) {
                var gameInstance = Game.getInstance();
                gameInstance.addMessageToProcess('unregister', socket);
                console.log('user ' + socket.name + ' unregistered');
            }

            console.log('user disconnected');
        });
    });

    Game.getInstance().run();
};