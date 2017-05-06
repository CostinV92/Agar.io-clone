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
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        var element = document.getElementById('game');
        element.appendChild(canvas);

        // add canvas to game instance
        gameInstance.addCanvas(canvas);

        // add mouse event listener
        window.onmousemove = updateMousePosition;

        // add player position update function
        setInterval(updatePlayerPosition, 10);
    });

    socket.on('new_player', function(data) {
        if(Game.Instance)
            Game.getInstance().addMessageToProcess('new_player', data);
    })

    socket.on('delete_player', function(data) {
        if(Game.Instance)
                Game.getInstance().addMessageToProcess('delete_player', data);
    });

    socket.on('update_player', function(data) {
        //Process this message immediately but only if the game instance is ready
        if(!Game.ready)
            return;

        var game = Game.getInstance();
        game.processUpdatePlayer(data);
    })

    register = function () {
        if ($('#nickname').val()) {
            var name = $('#nickname').val();
            // set the socket name
            socket.name = name;
            var gameInstance = Game.getInstance(socket);
            // set the player name
            gameInstance.getPlayer().setName(name);
            gameInstance.addMessageToSend('register', gameInstance.getPlayer());
            $('#nickname').val('');

            // we run the game instace from here to start proccessing messages
            // althought the ready state will be set on registere
            gameInstance.run();
        }
    }

    updateMousePosition = function () {
        if(Game.ready) {
            var game = Game.getInstance();
            var mousePosition = {};
            mousePosition.x = event.x - 10;
            mousePosition.y = event.y - 28;
            Game.getInstance().getPlayer().updateMousePos(mousePosition);
        }
    }

    updatePlayerPosition = function () {
        if(Game.ready) {
            var game = Game.getInstance();
            Game.getInstance().getPlayer().updatePlayerPos();
        }
    }
});