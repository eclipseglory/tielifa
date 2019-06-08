import Figure3D from "./Figure3D.js";

export default class RectSurface extends Figure3D {
    constructor(p) {
        p = p || {};
        super(p);
        this.color = p['color'] || 'white';
    }

    applyDrawingStyle(ctx) {
        super.applyDrawingStyle(ctx);
        ctx.fillStyle = this.color;
    }

    set depth(v) {

    }

    get depth() {
        return 0;
    }

    drawSelf(ctx) {
        let width = this.width;
        let height = this.height;
        ctx.rect(-width / 2, -height / 2, width, height);
        ctx.fill();
    }

}