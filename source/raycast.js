const TILE_SIZE = 64;
const PLAYER_RADIUS = TILE_SIZE / 8;
const PLAYER_VIEW = PLAYER_RADIUS * 8; 
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * Math.PI/180;
const RAY_DETAIL_WIDTH = 32;
const NUM_RAYS = WINDOW_WIDTH / RAY_DETAIL_WIDTH;
const RAY_INCREMENT = FOV_ANGLE / NUM_RAYS;

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

    checkCollision(x,y,r) {
        if( x - r < 0 || x + r > WINDOW_WIDTH || y - r < 0 || y + r > WINDOW_HEIGHT )
            return true;

        var p1x = Math.floor((x-r)/TILE_SIZE);
        var p1y = Math.floor((y-r)/TILE_SIZE);

        var p2x = Math.floor((x+r)/TILE_SIZE);
        var p2y = Math.floor((y+r)/TILE_SIZE);

        return this.grid[p1y][p1x] == 1 || 
            this.grid[p1y][p2x] == 1 ||
            this.grid[p2y][p1x] == 1 ||
            this.grid[p2y][p2x] == 1;
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
        this.radius = PLAYER_RADIUS;
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

        if( !grid.checkCollision(newX, this.y, this.radius) ) {
            this.x = newX;
        }

        if( !grid.checkCollision(this.x, newY, this.radius) ) {
            this.y = newY;
        }
    }

    render() {
        stroke("#111");
        fill("red");
        circle(this.x, this.y, this.radius);
    }
}

class Ray {
    constructor(rayAngle) {
        this.rayAngle = rayAngle;
    }

    render() {
        stroke("#09f");
        line(
            player.x, 
            player.y, 
            player.x + Math.cos(this.rayAngle) * PLAYER_VIEW,
            player.y + Math.sin(this.rayAngle) * PLAYER_VIEW
        );
    }
}

var grid = new Map();
var player = new Player();
var rays = [];

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

function castAllRays() {
    let columnId = 0;

    let rayAngle = player.rotationAngle - (FOV_ANGLE / 2);
    rays = [];

    for(let i = 0; i < NUM_RAYS; i++) {
        var ray = new Ray(rayAngle);
        // ray.cast();
        rays.push(ray);
        rayAngle += (RAY_INCREMENT);
        columnId++;
    }
}

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
    player.update();
    castAllRays();
}

function draw() {
    update();

    grid.render();
    for(ray of rays) {
        ray.render();
    }
    player.render();
}
