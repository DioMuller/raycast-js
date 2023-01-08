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

const MINIMAP_SCALE_FACTOR = 0.2;
const SHADE_FACTOR = 170;

const VERTICAL_SHADE_OFFSET = 1.0;
const HORIZONTAL_SHADE_OFFSET = 0.75;

const DISTANCE_PROJECTION_PLANE = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 1],
            [1, 0, 0, 4, 0, 4, 0, 0, 0, 0, 0, 0, 3, 0, 1],
            [1, 0, 4, 4, 4, 0, 0, 0, 0, 0, 3, 0, 3, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 0, 1],
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

        return this.grid[p1y][p1x] != 0 || 
            this.grid[p1y][p2x] != 0 ||
            this.grid[p2y][p1x] != 0 ||
            this.grid[p2y][p2x] != 0;
    }

    getValue(x,y) {
        let p1x = Math.floor(x/TILE_SIZE);
        let p1y = Math.floor(y/TILE_SIZE);

        return this.grid[p1y][p1x];
    }

    render() {
        for (let i = 0; i < MAP_NUM_ROWS; i++) {
            for (let j = 0; j < MAP_NUM_COLS; j++) {
                let tileX = j * TILE_SIZE; 
                let tileY = i * TILE_SIZE;
                let tileColor = this.grid[i][j] == 0 ? "#ccc" : "#222";
                stroke("#111");
                fill(tileColor);
                rect(tileX * MINIMAP_SCALE_FACTOR, 
                    tileY * MINIMAP_SCALE_FACTOR, 
                    TILE_SIZE * MINIMAP_SCALE_FACTOR, 
                    TILE_SIZE * MINIMAP_SCALE_FACTOR
                );
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
        circle(this.x * MINIMAP_SCALE_FACTOR, 
            this.y * MINIMAP_SCALE_FACTOR, 
            this.radius * MINIMAP_SCALE_FACTOR
        );
    }
}

class Ray {
    constructor(rayAngle) {
        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;
        this.wasHitVertical = false;

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
        let horizontalWallHitX = 0;
        let horizontalWallHitY = 0;

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

        while(!foundHorizontalWallHit) {
            if( grid.checkCollision(nextHorizontalTouchX, nextHorizontalTouchY - (this.isRayFacingUp ? 1 : 0), 0)) {
                foundHorizontalWallHit = true;
                horizontalWallHitX = nextHorizontalTouchX;
                horizontalWallHitY = nextHorizontalTouchY;
            } else {
                nextHorizontalTouchX += xstep;
                nextHorizontalTouchY += ystep;
            }
        }

        // VERTICAL RAY-GRID INTERSECTION
        let foundVerticalWallHit = false;
        let verticalWallHitX = 0;
        let verticalWallHitY = 0;

        xintercept = (Math.floor(player.x / TILE_SIZE) * TILE_SIZE);
        xintercept += (this.isRayFacingRight ? TILE_SIZE : 0);
        yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

        xstep = TILE_SIZE;
        xstep *= (this.isRayFacingLeft ? -1 : 1);
        ystep = TILE_SIZE * Math.tan(this.rayAngle);
        ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
        ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

        let nextVerticalTouchX = xintercept;
        let nextVerticalTouchY = yintercept;

        while(!foundVerticalWallHit) {
            if( grid.checkCollision(nextVerticalTouchX - (this.isRayFacingLeft ? 1 : 0), nextVerticalTouchY, 0)) {
                foundVerticalWallHit = true;
                verticalWallHitX = nextVerticalTouchX;
                verticalWallHitY = nextVerticalTouchY;
            } else {
                nextVerticalTouchX += xstep;
                nextVerticalTouchY += ystep;
            }
        }

        // Calculate the closest hit
        let distHorizontal = dist(horizontalWallHitX, horizontalWallHitY, player.x, player.y);
        let distVertical = dist(verticalWallHitX, verticalWallHitY, player.x, player.y);

        // Pick the closest hit.
        if(distVertical <= distHorizontal ){
            this.wallHitX = verticalWallHitX;
            this.wallHitY = verticalWallHitY;
            this.distance = distVertical;
            this.wasHitVertical = true;

        } else {
            this.wallHitX = horizontalWallHitX;
            this.wallHitY = horizontalWallHitY;
            this.distance = distHorizontal;
            this.wasHitVertical = false;
        }
    }

    render() {
        stroke("#09f");
        line(player.x * MINIMAP_SCALE_FACTOR, 
            player.y * MINIMAP_SCALE_FACTOR, 
            this.wallHitX * MINIMAP_SCALE_FACTOR,
            this.wallHitY * MINIMAP_SCALE_FACTOR
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
    let rayAngle = player.rotationAngle - (FOV_ANGLE / 2);
    rays = [];

    for(let i = 0; i < NUM_RAYS; i++) {
        let ray = new Ray(rayAngle);
        ray.cast(i);
        rays.push(ray);
        rayAngle += (RAY_INCREMENT);
    }
}

function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if( angle < 0 ) angle += (2*Math.PI);

    return angle;
}

function renderProjectedWalls() {
    for( let i = 0; i < NUM_RAYS; i++ ) {
        let ray = rays[i];

        let rayDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);
        let wallHeight = (TILE_SIZE / rayDistance) * DISTANCE_PROJECTION_PLANE;
        let alpha = SHADE_FACTOR / rayDistance;

        let alphaOffset = 1 / (rayDistance / SHADE_FACTOR) ;
        let colorOffset = ray.wasHitVertical ? VERTICAL_SHADE_OFFSET : HORIZONTAL_SHADE_OFFSET;

        fillForWall(grid.getValue(ray.wallHitX - (ray.isRayFacingLeft ? 1 : 0), ray.wallHitY - (ray.isRayFacingUp ? 1 : 0)), colorOffset, alphaOffset);
        noStroke();
        rect(i * RAY_DETAIL_WIDTH,
            (WINDOW_HEIGHT/2) - (wallHeight/2),
            RAY_DETAIL_WIDTH,
            wallHeight
        );
    }
}

function fillForWall(wallType, colorOffset, alphaOffset ) {
    switch(wallType) {
        case 1:
            fill(255 * colorOffset,
                255 * colorOffset,
                255 * colorOffset,
                255 * alphaOffset
            );
            break;
        case 2:
            fill(255 * colorOffset,
                0 * colorOffset,
                0 * colorOffset,
                255 * alphaOffset
            );
            break;
        case 3:
            fill(0 * colorOffset,
                255 * colorOffset,
                0 * colorOffset,
                255 * alphaOffset
            );
            break;
        case 4:
            fill(0 * colorOffset,
                0 * colorOffset,
                255 * colorOffset,
                255 * alphaOffset
            );
            break;
        default:
            fill(255 * colorOffset,
                255 * colorOffset,
                255 * colorOffset,
                0 * alphaOffset
            );
            break;
    }
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
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

    clear();
    renderProjectedWalls();

    grid.render();
    for(ray of rays) {
        ray.render();
    }
    player.render();
}
