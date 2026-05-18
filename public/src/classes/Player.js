import { INITIAL_FRAMES, PATH_SPACESHIP_IMAGE } from "../utils/constants.js";
import Projectile from "./Projectile.js";

const MAX_LIVES = 3;
const INVINCIBILITY_FRAMES = 120;

class Player {
    constructor(canvasWidth, canvasHeight) {
        this.alive = true;
        this.lives = MAX_LIVES;
        this.width = 48 * 2;
        this.height = 48 * 2;
        this.velocity = 6;

        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.position = {
            x: canvasWidth / 2 - this.width / 2,
            y: canvasHeight - this.height - 30,
        };

        this.image = this.getImage(PATH_SPACESHIP_IMAGE);

        this.sx = 0;
        this.framesCounter = INITIAL_FRAMES;

        this.invincible = false;
        this.invincibilityTimer = 0;
    }

    getImage(path) {
        if (!Player._imageCache) Player._imageCache = new Map();
        if (!Player._imageCache.has(path)) {
            const img = new Image();
            img.src = path;
            Player._imageCache.set(path, img);
        }
        return Player._imageCache.get(path);
    }


    moveLeft() {
        this.position.x = Math.max(0, this.position.x - this.velocity);
    }

    moveRight() {
        this.position.x = Math.min(this.canvasWidth - this.width, this.position.x + this.velocity);
    }


    draw(context) {
        const shouldFlash = this.invincible && Math.floor(this.invincibilityTimer / 6) % 2 === 0;

        if (!shouldFlash) {
            context.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );

        }

        this.update();
    }

    update() {
        if (this.framesCounter === 0) {
            this.sx = this.sx === 96 ? 0 : this.sx + 48;
            this.framesCounter = 15;
        }

        this.framesCounter--;

        if (this.invincible) {
            this.invincibilityTimer--;
            if (this.invincibilityTimer <= 0) {
                this.invincible = false;
                this.invincibilityTimer = 0;
            }
        }
    }

    takeDamage() {
        if (this.invincible) return false;

        this.lives--;

        if (this.lives <= 0) {
            this.alive = false;
            return true;
        }

        this.invincible = true;
        this.invincibilityTimer = INVINCIBILITY_FRAMES;
        return false;
    }

    gainLife() {
        if (this.lives < MAX_LIVES) {
            this.lives++;
        }
    }

    reset(canvasWidth, canvasHeight) {
        this.alive = true;
        this.lives = MAX_LIVES;
        this.invincible = false;
        this.invincibilityTimer = 0;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.position.x = canvasWidth / 2 - this.width / 2;
        this.position.y = canvasHeight - this.height - 30;
    }

    shoot(projectiles) {
        const p = new Projectile({
            x: this.position.x + this.width / 2 - 1,
            y: this.position.y,
        },
            -7,
            "#0091ff"
        );

        projectiles.push(p);
    }


    hit(projectile) {
        if (this.invincible) return false;

        return (
            projectile.position.x >= this.position.x + 20 &&
            projectile.position.x <= this.position.x + 20 + this.width - 38 &&
            projectile.position.y >= this.position.y + 22 &&
            projectile.position.y <= this.position.y + 22 + this.height - 34
        );
    }
}

export default Player;