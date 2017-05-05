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

        // delete registration form and message board
        var elem = document.getElementById('register');
        elem.parentNode.removeChild(elem);
        elem = document.getElementById('board');
        elem.parentNode.removeChild(elem);

        // add canvas to web page
        var canvas = document.createElement('canvas');
        canvas.id = 'canvas';
        canvas.width  = window.innerWidth-50;
        canvas.height = window.innerHeight-50;
        var element = document.getElementById('game');
        element.appendChild(canvas);

        // add canvas to game instance
        gameInstance.addCanvas(canvas);

        // add mouse event listener
        document.onmousemove = getMousePosition;
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
            var gameInstance = new Game(socket);
            gameInstance.addMessageToSend('register', gameInstance.getPlayer());
            $('#nickname').val('');
            gameInstance.run();
        }
    }

    getMousePosition = function () {
        var newPosition = {};
        newPosition.x = event.x - 10;
        newPosition.y = event.y - 28    ;
        Game.getInstance().getPlayer().setPos(newPosition);
    }
});