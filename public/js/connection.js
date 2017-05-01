$( document ).ready(function() {
    var socket = io();

    socket.on('message', function(msg) {
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('registered', function(msg) {
        // TODO here the game instance will be received
        $('#important_messages').append($('<li>').text(msg));
    });

    register = function () {
        if ($('#nickname').val()) {
            socket.emit('register', $('#nickname').val());
            $('#nickname').val('');
        }
    }
});