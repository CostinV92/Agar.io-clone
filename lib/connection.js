module.exports = function (http) {
    var io = require('socket.io')(http);;

    io.on('connection', function(socket) {
        console.log('user conected');
        socket.broadcast.emit('message', 'client conected');

        socket.on('disconnect', function() {
            socket.broadcast.emit('message', 'client disconnected');
            console.log('user disconnected');
        });
    });
};