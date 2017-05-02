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

    // mass of the player
    // i think that in function of this i'll draw the player
    this.mass = 0;
}

module.exports = Player;