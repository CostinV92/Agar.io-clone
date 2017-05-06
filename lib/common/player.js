var Player = function(socket, position) {

    // client socket
    this.socket = socket;

    // player name;
    this.name = socket.name;

    // global position
    this.pos = position;

    // mouse position
    this.mousePos = {x: 0, y: 0};

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

Player.prototype.updateMousePos = function(mousePosition) {
    this.mousePos = mousePosition;
}

Player.prototype.updatePlayerPos = function() {
    var currentPosition = this.pos;
    var mousePosition = this.mousePos;
    var directionVector = {x: mousePosition.x - currentPosition.x, y: mousePosition.y - currentPosition.y};
    var directionVectorLength = Math.sqrt(Math.pow(directionVector.x, 2) + Math.pow(directionVector.y, 2));
    var normateDirection = {x: directionVector.x / directionVectorLength, y: directionVector.y / directionVectorLength}

    this.pos.x = currentPosition.x + (normateDirection.x * (50 * 1/this.mass));
    this.pos.y = currentPosition.y + (normateDirection.y * (50 * 1/this.mass));
}

Player.prototype.setName = function(name) {
    this.name = name;
}

Player.prototype.sendUpdatePlayer = function() {
    var socket = this.socket;
    var toSend = {
        'name': this.name,
        'pos' : this.pos,
        'mass': this.mass
    };

    socket.emit('update_player', toSend);
}

module.exports = Player;