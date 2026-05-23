import { PATH_LASER_SPECIAL_IMAGE } from "../utils/constants.js";

class Projectile {
    constructor(position, velocity, color, isSpecial = false) {
        this.position = position;
        this.isSpecial = isSpecial;
        this.width = isSpecial ? 64 : 3;
        this.height = isSpecial ? 64 : 22;
        this.velocity = velocity;
        this.color = color;

        if (isSpecial) {
            this.image = Projectile._getSpecialImage();
        }
    }

    static _getSpecialImage() {
        if (!Projectile._specialImage) {
            const img = new Image();
            img.src = PATH_LASER_SPECIAL_IMAGE;
            Projectile._specialImage = img;
        }
        return Projectile._specialImage;
    }

    draw(context) {
        context.save();

        if (this.isSpecial) {
            this._drawSpecial(context);

        } else {
            this._drawNormal(context);
        }

        context.restore();
    }

    _drawNormal(context) {
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
    }

    _drawSpecial(context) {
        if (this.image && this.image.complete && this.image.naturalWidth > 0) {
            context.shadowColor = "#0091ff";
            context.shadowBlur = 20;
            context.globalAlpha = 1;
            context.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );

        } else {
            context.globalAlpha = 1;
            context.fillStyle = this.color;
            context.shadowColor = this.color;
            context.shadowBlur = 16;
            context.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }

    update() {
        this.position.y += this.velocity;
    }
}

export default Projectile;