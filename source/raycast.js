const TILE_SIZE = 64;
const PLAYER_RADIUS = TILE_SIZE / 8;
const PLAYER_VIEW = PLAYER_RADIUS * 8; 
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * Math.PI/180;
const RAY_DETAIL_WIDTH = 1;
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

        let p1x = Math.floor((x-r)/TILE_SIZE);
        let p1y = Math.floor((y-r)/TILE_SIZE);

        let p2x = Math.floor((x+r)/TILE_SIZE);
        let p2y = Math.floor((y+r)/TILE_SIZE);

        return this.grid[p1y][p1x] == 1 || 
            this.grid[p1y][p2x] == 1 ||
            this.grid[p2y][p1x] == 1 ||
            this.grid[p2y][p2x] == 1;
    }

    render() {
        for (let i = 0; i < MAP_NUM_ROWS; i++) {
            for (let j = 0; j < MAP_NUM_COLS; j++) {
                let tileX = j * TILE_SIZE; 
                let tileY = i * TILE_SIZE;
                let tileColor = this.grid[i][j] == 1 ? "#222" : "#ccc";
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

        let moveStep = this.walkDirection * this.moveSpeed;
        let newX = this.x + Math.cos(this.rotationAngle) * moveStep; 
        let newY = this.y + Math.sin(this.rotationAngle) * moveStep; 

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
        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;

        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;

        this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }

    cast(columnId) {
        let xintercept, yintercept;
        let xstep, ystep;

        // HORIZONTAL RAY-GRID INTERSECTION
        let foundHorizontalWallHit = false;
        let wallHitX = 0;
        let wallHitY = 0;

        yintercept = (Math.floor(player.y / TILE_SIZE) * TILE_SIZE);
        yintercept += (this.isRayFacingDown ? TILE_SIZE : 0);
        xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

        ystep = TILE_SIZE;
        ystep *= (this.isRayFacingUp ? -1 : 1);
        xstep = TILE_SIZE / Math.tan(this.rayAngle);
        xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
        xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

        let nextHorizontalTouchX = xintercept;
        let nextHorizontalTouchY = yintercept;

        if( this.isRayFacingUp) nextHorizontalTouchY--;

        while(!foundHorizontalWallHit) {
            if( grid.checkCollision(nextHorizontalTouchX, nextHorizontalTouchY, 1)) {
                foundHorizontalWallHit = true;
                wallHitX = nextHorizontalTouchX;
                wallHitY = nextHorizontalTouchY;

                // Test 
                this.wallHitX = wallHitX;
                this.wallHitY = wallHitY;

            } else {
                nextHorizontalTouchX += xstep;
                nextHorizontalTouchY += ystep;
            }
        }
    }

    render() {
        stroke("#09f");
        line(player.x, player.y, this.wallHitX,this.wallHitY);
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
        let ray = new Ray(rayAngle);
        ray.cast(columnId);
        rays.push(ray);
        rayAngle += (RAY_INCREMENT);
        columnId++;
    }
}

function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if( angle < 0 ) angle += (2*Math.PI);

    return angle;
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
