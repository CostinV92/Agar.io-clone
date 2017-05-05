var Player = function(socket, position) {

    // client socket
    this.socket = socket;

    // player name;
    this.name = socket.name;

    // global position
    this.pos = position;

    // TODO change this to be accurate
    // view position
    // we'll see about this
    /*this.posVX = posX;
    this.posVY = posY;*/

    // mass of the player
    // i think that in function of this i'll draw the player
    this.mass = 10;
}

Player.prototype.setPos = function(position) {
    this.pos = position;
}

module.exports = Player;