class Obstacle {
    constructor(position, width, height, imagePath) {
        this.position = position;
        this.width = width;
        this.height = height;
        this.maxHp = 5;
        this.hp = this.maxHp;

        this.image = new Image();
        this.image.src = imagePath;
    }

    draw(context) {
        context.save();

        context.globalAlpha = 0.4 + (this.hp / this.maxHp) * 0.6;

        context.shadowColor = "#8B7355";
        context.shadowBlur = 6 * (this.hp / this.maxHp);

        if (this.image.complete) {
            context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        } else {
            context.fillRect(this.position.x, this.position.y, this.width, this.height);
        }

        context.restore();
    }

    hit(projectile) {
        const pLeft = projectile.position.x;
        const pRight = projectile.position.x + projectile.width;
        const pTop = projectile.position.y;
        const pBottom = projectile.position.y + projectile.height;

        const oLeft = this.position.x;
        const oRight = this.position.x + this.width;
        const oTop = this.position.y;
        const oBottom = this.position.y + this.height;

        const wasHit = (
            pRight >= oLeft &&
            pLeft <= oRight &&
            pBottom >= oTop &&
            pTop <= oBottom
        );

        if (wasHit) {
            this.hp--;
        }

        return wasHit;
    }

    isDestroyed() {
        return this.hp <= 0;
    }
}

export default Obstacle;