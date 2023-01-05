const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }

    hasWallAt(x,y,r) {
        if( x - r < 0 || x + r > WINDOW_WIDTH || y - r < 0 || y + r > WINDOW_HEIGHT )
            return true;

        var p1x = Math.floor((x-r)/TILE_SIZE);
        var p1y = Math.floor((y-r)/TILE_SIZE);

        var p2x = Math.floor((x+r)/TILE_SIZE);
        var p2y = Math.floor((y+r)/TILE_SIZE);

        return this.grid[p1y][p1x] == 1 || this.grid[p2y][p2x] == 1;
    }

    render() {
        for (var i = 0; i < MAP_NUM_ROWS; i++) {
            for (var j = 0; j < MAP_NUM_COLS; j++) {
                var tileX = j * TILE_SIZE; 
                var tileY = i * TILE_SIZE;
                var tileColor = this.grid[i][j] == 1 ? "#222" : "#ccc";
                stroke("#111");
                fill(tileColor);
                rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

class Player {
    constructor() {
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 2;
        this.radius = 4;
        this.turnDirection = 0; // -1 if left, +1 if right
        this.walkDirection = 0; // -1 if back, +1 if front
        this.rotationAngle = Math.PI / 2;
        this.moveSpeed = 2.0;
        this.rotationSpeed = 2 * (Math.PI / 180);
    }

    update() {
        this.rotationAngle += (this.turnDirection * this.rotationSpeed);

        var moveStep = this.walkDirection * this.moveSpeed;
        var newX = this.x + Math.cos(this.rotationAngle) * moveStep; 
        var newY = this.y + Math.sin(this.rotationAngle) * moveStep; 

        if( !grid.hasWallAt(newX, this.y, this.radius) ) {
            this.x = newX;
        }

        if( !grid.hasWallAt(this.x, newY, this.radius) ) {
            this.y = newY;
        }
    }

    render() {
        stroke("blue");
        line(
            this.x, 
            this.y, 
            this.x + Math.cos(this.rotationAngle) * 32, 
            this.y +  Math.sin(this.rotationAngle) * 32);

        stroke("#111");
        fill("red");
        circle(this.x, this.y, this.radius);
    }
}

var grid = new Map();
var player = new Player();

function keyPressed() {
    if(keyCode == UP_ARROW) {
        player.walkDirection = 1;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = -1;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = 1;
    } else if (keyCode == LEFT_ARROW) { 
        player.turnDirection = -1;
    }
}

function keyReleased() {
    if(keyCode == UP_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = 0;
    } else if (keyCode == LEFT_ARROW) { 
        player.turnDirection = 0;
    }
}

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
    player.update();
}

function draw() {
    update();

    grid.render();
    player.render();
}
