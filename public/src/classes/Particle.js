class Particle {
    constructor(position, velocity, radius, color) {
        this.position = position;
        this.velocity = velocity;
        this.radius = radius * (0.5 + Math.random() * 1.2);
        this.color = color;
        this.opacity = 1;
        this.friction = 0.98;
        this.fadeRate = 0.012 + Math.random() * 0.01;
    }

    draw(context) {
        context.save();
        context.beginPath();
        context.globalAlpha = this.opacity;
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);

        context.shadowColor = this.color;
        context.shadowBlur = 4;

        context.fillStyle = this.color;
        context.fill();
        context.closePath();
        context.restore();
    }

    update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.position.x += this.velocity.x;
        this.position.y -= this.velocity.y;
        this.opacity = this.opacity - this.fadeRate <= 0 ? 0 : this.opacity - this.fadeRate;
    }
}

export default Particle;