import Figure3D from "./Figure3D.js";
import CanvasRenderingContextWebgl2D from "../webgl/CanvasRenderingContextWebgl2D.js";

export default class Stage extends Figure3D {
    constructor(canvas, p) {
        p = p || {};
        if (p.FOV == null) p.FOV = 40;
        if (p.enableDepthTest == null) p.enableDepthTest = true;
        if (p.projectionType == null) p.projectionType = 1;
        super(p);
        this.gl = new CanvasRenderingContextWebgl2D(canvas, p);
        this.z = 0;
        this.width = canvas.width;
        this.height = canvas.height;
        this.x = this.width / 2;
        this.y = this.height / 2;
        this.depth = 2000;
        let that = this;
        this._stop = false;
        this._isRunning = false;
        this.loop = function () {
            if (that._stop) return;
            that.repeat();
            requestAnimationFrame(that.loop);
        }
    }

    drawSelf(ctx) {
    }

    repeat() {
        this.gl.clean();
        this.update(this.gl);
        this.gl.draw();
    }

    start() {
        if (this._isRunning) return;
        if (this._stop) {
            this._stop = false;
            this._isRunning = true;
            return;
        }
        this._stop = false;
        this._isRunning = true;
        this.loop();
    }

    stop() {
        this._stop = true;
        this._isRunning = false;
    }
}