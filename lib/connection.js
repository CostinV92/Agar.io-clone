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
            console.log('user ' + name + ' registered');

            // TODO make a new Game instance and send it back to the client (having it's own player instance)
            socket.emit('registered', 'You\'ve been registered!');
        });

        socket.on('disconnect', function() {
            socket.broadcast.emit('message', 'client disconnected');
            console.log('user disconnected');
        });
    });
};