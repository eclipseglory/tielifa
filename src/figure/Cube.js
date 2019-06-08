import Figure3D from "./Figure3D.js";
import Tools from "../utils/Tools.js";

const F_V = [0, 0, 1];
const B_V = [0, 0, -1];
const R_V = [1, 0, 0];
const L_V = [-1, 0, 0];
const T_V = [0, -1, 0];
const BOTTOM_V = [0, 1, 0];
const UV = [0, 0];
export default class Cube extends Figure3D {
    constructor(p) {
        p = p || {};
        p.verticesNum = 24;
        super(p);
        this.color = p['color'] || "#FFFFFF";

        this.frontColor = p.frontColor;
        this.backColor = p.backColor;
        this.rightColor = p.rightColor;
        this.leftColor = p.leftColor;
        this.bottomColor = p.bottomColor;
        this.topColor = p.topColor;

        this.topOpa = p.topOpacity;
        if (this.topOpa == null) this.topOpa = 1;
        this.bottomOpa = p.bottomOpacity;
        if (this.bottomOpa == null) this.bottomOpa = 1;
        this.rightOpa = p.rightOpacity;
        if (this.rightOpa == null) this.rightOpa = 1;
        this.leftOpa = p.leftOpacity;
        if (this.leftOpa == null) this.leftOpa = 1;
        this.frontOpa = p.frontOpacity;
        if (this.frontOpa == null) this.frontOpa = 1;
        this.backOpa = p.backOpacity;
        if (this.backOpa == null) this.backOpa = 1;
    }

    applyDrawingStyle(ctx) {
        super.applyDrawingStyle(ctx);
        ctx.fillStyle = this.color;
    }

    drawSelf(ctx) {
        ctx.fillStyle = this.color;
        let width = this.width;
        let height = this.height;
        let depth = this.depth;

        let hWidth = width / 2;
        let hHeight = height / 2;
        let hDepth = depth / 2;
        ctx.save();
        if (this.frontColor != null)
            ctx.fillStyle = this.frontColor;
        ctx.globalAlpha = this.frontOpa * this.opacity;
        ctx.fillRect(-hWidth, -hHeight, width, height, hDepth);
        ctx.restore();

        //背面
        ctx.save();
        if (this.backColor != null)
            ctx.fillStyle = this.backColor;
        ctx.globalAlpha = this.backOpa * this.opacity;
        ctx.rotateY(Math.PI);
        ctx.fillRect(-hWidth, -hHeight, width, height, hDepth);
        ctx.restore();

        //左侧：
        ctx.save();
        if (this.leftColor != null)
            ctx.fillStyle = this.leftColor;
        ctx.globalAlpha = this.leftOpa * this.opacity;
        ctx.rotateY(-Tools.HALFPI);
        ctx.fillRect(-hDepth, -hHeight, depth, height, hWidth);
        ctx.restore();

        //右侧：
        ctx.save();
        if (this.rightColor != null)
            ctx.fillStyle = this.rightColor;
        ctx.globalAlpha = this.rightOpa * this.opacity;
        ctx.rotateY(Tools.HALFPI);
        ctx.fillRect(-hDepth, -hHeight, depth, height, hWidth);
        ctx.restore();

        //底部：
        ctx.save();
        if (this.bottomColor != null)
            ctx.fillStyle = this.bottomColor;
        ctx.globalAlpha = this.bottomOpa * this.opacity;
        ctx.rotateX(-Tools.HALFPI);
        ctx.fillRect(-hWidth, -hDepth, width, depth, hHeight);
        ctx.restore();

        //顶部：
        ctx.save();
        if (this.topColor != null)
            ctx.fillStyle = this.topColor;
        ctx.globalAlpha = this.topOpa * this.opacity;
        ctx.rotateX(Tools.HALFPI);
        ctx.fillRect(-hWidth, -hDepth, width, depth, hHeight);
        ctx.restore();
    }
}