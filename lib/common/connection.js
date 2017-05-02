var Game = require('./game.js');

$( document ).ready(function() {
    var socket = io();

    socket.on('message', function(msg) {
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('registered', function(data) {
        // I've been registered
        // Instantiate the game
        var gameInstance = Game.getInstance();
        gameInstance.addMessageToProcess('registered', data);
    });

    socket.on('new_player', function(data) {
        if(Game.Instance)
            Game.getInstance().addMessageToProcess('new_player', data);
    })

    socket.on('delete_player', function(data) {
        if(Game.Instance)
                Game.getInstance().addMessageToProcess('delete_player', data);
    });

    register = function () {
        if ($('#nickname').val()) {
            socket.name = $('#nickname').val();
            var gameInstance = Game.getInstance(socket);
            gameInstance.addMessageToSend('register', gameInstance.getPlayer());
            $('#nickname').val('');
            gameInstance.run();
        }
    }
});