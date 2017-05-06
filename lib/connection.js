var Game = require('./common/game.js');
var Player = require('./common/player.js');

module.exports = function (http) {
    var io = require('socket.io')(http);

    io.on('connection', function(socket) {
        console.log('client conected');

        socket.on('register', function(name) {
            if(socket.name)
                return;

            // create a new Player instance and add it to the game
            var gameInstance = Game.getInstance();
            if (gameInstance.getPlayer(name)) {
                // nickname in use
                socket.emit('message', 'Nickname in use!');
                return;
            }

            // save the name to easily find the player
            // in case the connection goes down
            socket.name = name;

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

        // The update_player message will be proccessed immediately
        socket.on('update_player', function(data) {
            Game.getInstance().processUpdatePlayer(data);
        })
    });

    Game.getInstance().run();
};