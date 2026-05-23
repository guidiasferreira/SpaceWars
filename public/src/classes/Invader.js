import { PATH_INVADER_IMG } from "../utils/constants.js";
import Projectile from "./Projectile.js";

class Invader {
    constructor(position, velocity) {
        this.position = position;
        this.scale = 0.8;
        this.width = 50 * this.scale;
        this.height = 37 * this.scale;
        this.velocity = velocity;

        this.image = this.getImage(PATH_INVADER_IMG);
    }

    moveLeft() {
        this.position.x -= this.velocity;
    }

    moveRight() {
        this.position.x += this.velocity;
    }

    moveDown() {
        this.position.y += this.height;
    }

    incrementVelocity(boost) {
        this.velocity += boost;
    }

    getImage(path) {
        if (!Invader._imageCache) Invader._imageCache = new Map();
        if (!Invader._imageCache.has(path)) {
            const img = new Image();
            img.src = path;
            Invader._imageCache.set(path, img);
        }
        return Invader._imageCache.get(path);
    }

    draw(context) {
        context.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }

    shoot(projectiles, velocity = 4) {
        const p = new Projectile(
            {
                x: this.position.x + this.width / 2 - 2,
                y: this.position.y + this.height,
            },
            velocity,
            "#EF1D1C"
        );

        projectiles.push(p);
    }

    hit(projectile) {
        return (
            projectile.position.x + projectile.width >= this.position.x &&
            projectile.position.x <= this.position.x + this.width &&
            projectile.position.y + projectile.height >= this.position.y &&
            projectile.position.y <= this.position.y + this.height
        );
    }

    collided(obstacle) {
        return (
            obstacle.position.x + obstacle.width >= this.position.x &&
            obstacle.position.x <= this.position.x + this.width &&
            obstacle.position.y + obstacle.height >= this.position.y &&
            obstacle.position.y <= this.position.y + this.height
        );
    }
}

export default Invader;