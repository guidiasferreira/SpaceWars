import { INITIAL_FRAMES, PATH_SPACESHIP_IMAGE } from "../utils/constants.js";
import Projectile from "./Projectile.js";

const MAX_LIVES = 3;
const INVINCIBILITY_FRAMES = 120;
const MAX_SPECIAL = 100;
const SPECIAL_PER_KILL = 2;

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

        this.specialCharge = 0;
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


    draw(context, isPaused = false) {
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

        if (!isPaused) {
            this.update();
        }
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

    chargeSpecial() {
        this.specialCharge = Math.min(MAX_SPECIAL, this.specialCharge + SPECIAL_PER_KILL);
    }

    canFireSpecial() {
        return this.specialCharge >= MAX_SPECIAL;
    }

    fireSpecial(projectiles) {
        if (!this.canFireSpecial()) return false;

        const p = new Projectile(
            {
                x: this.position.x + this.width / 2 - 24,
                y: this.position.y - 20,
            },
            -10,
            "#0091ff",
            true
        );

        projectiles.push(p);
        this.specialCharge = 0;

        return true;
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
        this.specialCharge = 0;
    }

    shoot(projectiles) {
        const offsetLeft = 12; // Posição do canhão esquerdo
        const offsetRight = 12; // Posição do canhão direito
        const projectileWidth = 3;

        const pLeft = new Projectile(
            {
                x: this.position.x + offsetLeft,
                y: this.position.y + 15,
            },
            -7,
            "#0091ff"
        );

        const pRight = new Projectile(
            {
                x: this.position.x + this.width - offsetRight - projectileWidth,
                y: this.position.y + 15,
            },
            -7,
            "#0091ff"
        );

        projectiles.push(pLeft, pRight);
    }


    hit(projectile) {
        if (this.invincible) return false;

        const hitbox = {
            x: this.position.x + 10,
            y: this.position.y + 15,
            width: this.width - 20,
            height: this.height - 20
        };

        return (
            projectile.position.x + projectile.width >= hitbox.x &&
            projectile.position.x <= hitbox.x + hitbox.width &&
            projectile.position.y + projectile.height >= hitbox.y &&
            projectile.position.y <= hitbox.y + hitbox.height
        );
    }
}

export default Player;