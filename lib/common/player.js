var Player = function(socket, position, width, height) {

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

    // map size
    this.width = width;
    this.height = height;
}

Player.prototype.setPos = function(position) {
    this.pos = position;
    this.posV.x = position.x - (window.innerWidth / 2);
    this.posV.y = position.y - (window.innerHeight / 2);

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

    if(this.pos.x > window.innerWidth / 2 && this.pos.x < this.width - window.innerWidth / 2)
        this.posV.x = currentPositionV.x + (normateDirection.x * (5/Math.sqrt(Math.log(this.mass))));
    if(this.pos.y > window.innerHeight / 2 && this.pos.y < this.height - window.innerHeight / 2)
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

Player.prototype.sendUpdatePlayer = function(food, players) {
    var socket = this.socket;
    var toSend = {
        'name': this.name,
        'pos' : this.pos,
        'mass': this.mass
    };

    toSend['eatenFood'] = this.checkEatenFood(food);
    toSend['eatenPlayers'] = this.checkEatenPlayers(players);

    socket.emit('update_player', toSend);
}

Player.prototype.checkEatenFood = function(food) {
    var eatenFood = {};
    for(it in food) {
        if(circleFoodCollision(this, food[it])) {
            eatenFood[it] = food[it];
            delete food[it];
            this.foodAmount--;
            this.mass += 0.5;
        }
    }

    return eatenFood;
}

Player.prototype.checkEatenPlayers = function(players) {
    var eatenPlayers = {};
    for(it in players) {
        if(circlePlayerCollision(this, players[it])) {
            eatenPlayers[it] = players[it];
            delete players[it];
            this.mass += eatenPlayers[it].mass;
        }
    }

    return eatenPlayers;
}

function circleFoodCollision(c1, c2) {
    var dV = {x: c2.x - c1.pos.x, y: c2.y - c1.pos.y};
    if (Math.pow(dV.x, 2) + Math.pow(dV.y, 2) <= Math.pow(c1.mass + 9, 2))
        return true;

    return false;
}

function circlePlayerCollision(c1, c2) {
    var dV = {x: c2.pos.x - c1.pos.x, y: c2.pos.y - c1.pos.y};
    var offset = Math.min(c1.mass, c2.mass);
    if (Math.pow(dV.x, 2) + Math.pow(dV.y, 2) <= Math.pow(c1.mass + c2.mass - offset, 2)) {
        if (c1.mass > 1.3 * c2.mass)
            return true;
    }

    return false;
}

module.exports = Player;