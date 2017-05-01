var Player = function(socket, posX, posY) {

    // client socket
    this.socket = socket;

    // player name;
    this.name = socket.name;

    // global position
    this.posX = posX;
    this.posY = posY;

    // TODO change this to be accurate
    // view position
    this.posVX = posX;
    this.posVY = posY;
}

module.exports = Player;