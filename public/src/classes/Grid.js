import Invader from "./Invader.js";

class Grid {
    constructor(rows, cols, canvasWidth = 800) {
        this.rows = rows;
        this.cols = cols;
        this.canvasWidth = canvasWidth;

        this.direction = "right";
        this.moveDown = false;

        this.invaderVelocity = 1;
        this.invaders = this.init();
    }

    init() {
        const array = [];
        const gridWidth = this.cols * 50;
        const margin = Math.floor(Math.random() * 36) + 5;
        const startFromRight = Math.random() > 0.5;

        let startX;
        if (startFromRight) {
            startX = this.canvasWidth - gridWidth - margin;
            this.direction = "left";
        } else {
            startX = margin;
            this.direction = "right";
        }

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const invader = new Invader({
                    x: startX + col * 50,
                    y: row * 37 + 120,
                }, this.invaderVelocity);

                array.push(invader);
            }
        }

        return array;
    }

    draw(context) {
        this.invaders.forEach((invader) => invader.draw(context));
    }

    update(playerStatus, canvasWidth) {
        if (this.reachedRightBoundary(canvasWidth)) {
            this.direction = "left";
            this.moveDown = true;

        } else if (this.reachedLeftBoundary()) {
            this.direction = "right";
            this.moveDown = true;
        }

        if (!playerStatus) this.moveDown = false;

        this.invaders.forEach((invader) => {
            if (this.moveDown) {
                invader.moveDown();
                invader.incrementVelocity(0.08);
                this.invadersVelocity = invader.velocity;
            }

            if (this.direction === "right") invader.moveRight();
            if (this.direction === "left") invader.moveLeft();
        });

        this.moveDown = false;
    }

    reachedRightBoundary(canvasWidth) {
        return this.invaders.some(
            (invader) => invader.position.x + invader.width >= canvasWidth
        );
    }

    reachedLeftBoundary() {
        return this.invaders.some(
            (invader) => invader.position.x <= 0
        );
    }

    getRandomInvader() {
        const index = Math.floor(Math.random() * this.invaders.length);
        return this.invaders[index];
    }

    restart(canvasWidth) {
        if (canvasWidth) this.canvasWidth = canvasWidth;
        this.invaders = this.init();
    }
}

export default Grid;