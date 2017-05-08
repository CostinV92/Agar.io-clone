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
    this.posV = {x: 0, y: 0};

    // mass of the player
    // i think that in function of this i'll draw the player
    this.mass = 10;
}

Player.prototype.setPos = function(position) {
    this.pos = position;
    this.posV.x = position.x - (1690 / 2);
    this.posV.y = position.y - (890 / 2);

    if (this.posV.x <= 10)
        this.posV.x = 10
    if (this.posV.y <= 10)
        this.posV.y = 10
}

Player.prototype.updateMousePos = function(mousePosition) {
    this.mousePos = mousePosition;
}

Player.prototype.updatePlayerPos = function() {
    var currentGamePosition = this.pos;
    var currentPositionV = this.posV;
    var currentPosition = {x: currentGamePosition.x - currentPositionV.x, y: currentGamePosition.y - currentPositionV.y};
    var mousePosition = this.mousePos;
    var directionVector = {x: mousePosition.x - currentPosition.x, y: mousePosition.y - currentPosition.y};
    var directionVectorLength = Math.sqrt(Math.pow(directionVector.x, 2) + Math.pow(directionVector.y, 2));
    var normateDirection = {x: directionVector.x / directionVectorLength, y: directionVector.y / directionVectorLength};

    this.pos.x = currentGamePosition.x + (normateDirection.x * (5/Math.sqrt(Math.log(this.mass))));
    this.pos.y = currentGamePosition.y + (normateDirection.y * (5/Math.sqrt(Math.log(this.mass))));

    if(this.pos.x > 1690 / 2 && this.pos.x < 10000 - 1690 / 2)
        this.posV.x = currentPositionV.x + (normateDirection.x * (5/Math.sqrt(Math.log(this.mass))));
    if(this.pos.y > 890 / 2 && this.pos.y < 10000 - 890 / 20)
        this.posV.y = currentPositionV.y + (normateDirection.y * (5/Math.sqrt(Math.log(this.mass))));

    if (this.pos.x <= 10)
        this.pos.x = 10;
    if (this.pos.y <= 10)
        this.pos.y = 10;
    if (this.posV.x <= 10)
        this.posV.x = 10
    if (this.posV.y <= 10)
        this.posV.y = 10
}

Player.prototype.setName = function(name) {
    this.name = name;
}

Player.prototype.sendUpdatePlayer = function(food) {
    var socket = this.socket;
    var toSend = {
        'name': this.name,
        'pos' : this.pos,
        'mass': this.mass
    };

    toSend['eatenFood'] = this.checkEaten(food);

    socket.emit('update_player', toSend);
}

Player.prototype.checkEaten = function(food) {
    var eatenFood = {};
    for(it in food) {
        if(circleCollision(this, food[it])) {
            eatenFood[it] = food[it];
            this.mass+= 0.5;
        }
    }

    return eatenFood;
}

function circleCollision(c1, c2) {
    var dV = {x: c2.x - c1.pos.x, y: c2.y - c1.pos.y};
    if (Math.pow(dV.x, 2) + Math.pow(dV.y, 2) <= Math.pow(c1.mass, 2) + 9 /*mass of the food 3 ^ 2 */)
        return true;

    return false;
}

module.exports = Player;