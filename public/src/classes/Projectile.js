class Projectile {
    constructor(position, velocity, color) {
        this.position = position;
        this.width = 3;
        this.height = 22;
        this.velocity = velocity;
        this.color = color;
    }

    draw(context) {
        context.save();

        context.globalAlpha = 0.25;
        context.fillStyle = this.color;
        context.shadowColor = this.color;
        context.shadowBlur = 6;
        const trailDir = this.velocity < 0 ? 1 : -1;
        context.fillRect(
            this.position.x - 0.5,
            this.position.y + trailDir * this.height * 0.3,
            this.width + 1,
            this.height * 0.6
        );

        context.globalAlpha = 1;
        context.shadowColor = this.color;
        context.shadowBlur = 12;
        context.fillStyle = this.color;
        context.fillRect(this.position.x, this.position.y, this.width, this.height);

        context.shadowBlur = 0;
        context.fillStyle = "#fff";
        context.globalAlpha = 0.7;
        context.fillRect(
            this.position.x + 0.5,
            this.position.y + 2,
            this.width - 1,
            this.height - 4
        );

        context.restore();
    }

    update() {
        this.position.y += this.velocity;
    }
}

export default Projectile;