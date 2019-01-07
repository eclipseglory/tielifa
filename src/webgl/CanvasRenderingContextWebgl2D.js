import ContextState from "./ContextState.js";
import CanvasDrawingStylesWebgl2D from "./CanvasDrawingStylesWebgl2D.js";
import Path3D from "./Path3D.js";
import Point3D from "./Point3D.js";
import SubPath3D from "./SubPath3D.js";
import Color from "./Color.js";
import RenderAction from "./RenderAction.js";
import WebGLRender from "./WebGLRender.js";
import Tools from "../utils/Tools.js";


let _canvas = Symbol('对应的Canvas');
let _stateStack = Symbol('状态栈');
let _stateArray = Symbol('状态数组，记录全部状态');
let _pathList = Symbol('路径列表');
let _renderActionList = Symbol('绘制动作List');
export default class CanvasRenderingContextWebgl2D {
    constructor(canvas, properties) {
        if (properties == null || properties == undefined) properties = [];
        this[_canvas] = canvas;
        if (canvas == null || canvas == undefined) throw new Error('TempCanvas can not be undefined or null');
        this.gl = canvas.getContext('webgl');
        if (this.gl == undefined) throw new Error('Current canvas doesnt support WebGL');
        this[_stateStack] = [];
        this[_stateArray] = [];
        this[_pathList] = [];
        this[_renderActionList] = [];
        this.webglRender = new WebGLRender(this.gl);

    }

    // getRenderAction(type) {
    //     if (this[_renderActionList].length == 0) {
    //         let action = new RenderAction(type);
    //         this[_renderActionList].push(action);
    //         return action;
    //     } else {
    //         let lastRender = this[_renderActionList][this[_renderActionList].length - 1];
    //         if (lastRender.type == type) {
    //             return lastRender;
    //         } else {
    //             let action = new RenderAction(type);
    //             this[_renderActionList].push(action);
    //             return action;
    //         }
    //     }
    // }

    get currentContextState() {
        if (this[_stateStack].length == 0) { // 状态栈永远不为空
            let state = new ContextState(new CanvasDrawingStylesWebgl2D());
            this[_stateStack].push(state);
            this[_stateArray].push(state);
            state.id = this[_stateArray].length - 1;
        }
        return this[_stateStack][this[_stateStack].length - 1];
    }

    get currentPath() {
        if (this[_pathList].length == 0) {
            this[_pathList].push(new Path3D());
        }
        return this[_pathList][this[_pathList].length - 1];
    }

    /**************** 下面是标准接口实现 *************************/

    /**
     * back-reference to the canvas
     * Canvas的回引用
     * @returns {canvas}
     */
    get canvas() {
        return this[_canvas];
    }

    set strokeStyle(stroke) {
        this.currentContextState.strokeStyle = stroke;
    }

    get strokeStyle() {
        return this.currentContextState.strokeStyle;
    }

    set fillStyle(fill) {
        this.currentContextState.fillStyle = fill;
    }

    get fillStyle() {
        return this.currentContextState.fillStyle;
    }

    set globalAlpha(alpha) {
        this.currentContextState.globalAlpha = alpha;
    }

    get globalAlpha() {
        return this.currentContextState.globalAlpha;
    }


    clean() {
        this[_pathList].length = 0;
        this.webglRender.clean();
    }

    /**
     * 没有实现,只能全部清空
     * @param left
     * @param top
     * @param width
     * @param height
     */
    clearRect(left, top, width, height) {
        this.clean();
    }

    /************** CanvasPathMethods ************************/

    // 没有实现的有这些：
    // arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    // arcTo(x1: number, y1: number, x2: number, y2: number, radiusX: number, radiusY: number, rotation: number): void;
    // bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    // quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;

    beginPath() {
        this.currentPath.clean();
    }

    /**
     * 关闭当前Path，下面是规范说明
     * The closePath() method must do nothing if the object's path has no subpaths.
     * Otherwise, it must mark the last subpath as closed,
     * create a new subpath whose first point is the same as the previous subpath's first point,
     * and finally add this new subpath to the path.
     */
    closePath() {
        let path = this.currentPath;
        if (path.subPathNumber == 0) return;
        let lastSubPath = path.lastSubPath;
        lastSubPath.close();
        let firstPoint = lastSubPath.getPoint(0);
        let newSubPath = new SubPath3D(firstPoint);
        path.addSubPath(newSubPath);
    }

    /**
     * 连接某个点x，y，下面是规范说明
     * The lineTo(x, y) method must ensure there is a subpath for (x, y) if the object's path has no subpaths.
     * Otherwise, it must connect the last point in the subpath to the given point (x, y) using a straight line,
     * and must then add the given point (x, y) to the subpath.
     * @param x
     * @param y
     * @param z
     */
    lineTo(x, y, z) {
        if (z == undefined) z = 0;
        let currentState = this.currentContextState;
        let currentSubPath = this.currentPath;
        let lastSubPath = currentSubPath.lastSubPath;
        let point = new Point3D(x, y, z);
        point.contextStateIndex = currentState.id;
        point.transformMatrixIndex = currentState.transformMatrixId;
        currentState.fireDirty();
        lastSubPath.pushPoint(point);
    }

    /**
     * 规范说明
     * The moveTo(x, y) method must create a new subpath with the specified point as its first (and only) point.
     * When the user agent is to ensure there is a subpath for a coordinate (x, y) on a path,
     * the user agent must check to see if the path has any subpaths,
     * and if it does not, then the user agent must create a new subpath with the point (x, y) as its first
     * (and only) point, as if the moveTo() method had been called.
     * @param x
     * @param y
     * @param z
     */
    moveTo(x, y, z) {
        if (z == undefined) z = 0;
        let currentState = this.currentContextState;

        let currentSubPath = this.currentPath;
        let point = new Point3D(x, y, z);
        point.contextStateIndex = currentState.id;
        point.transformMatrixIndex = currentState.transformMatrixId;
        currentState.fireDirty();

        let subPath = new SubPath3D(point);
        currentSubPath.addSubPath(subPath);
    }

    /**
     * The rect(x, y, w, h) method must create a new subpath containing just the four points
     * (x, y), (x+w, y), (x+w, y+h), (x, y+h), with those four points connected by straight lines,
     * and must then mark the subpath as closed.
     * It must then create a new subpath with the point (x, y) as the only point in the subpath.
     * @param x
     * @param y
     * @param w
     * @param h
     * @param depth 这个参数可选，不给的话就是0
     */
    rect(x, y, w, h, depth) {
        if (depth == undefined) depth = 0;
        this.moveTo(x, y, depth);
        this.lineTo(x + w, y, depth);
        this.lineTo(x + w, y + h, depth);
        this.lineTo(x, y + h, depth);
        let currentSubPath = this.currentPath.lastSubPath;
        currentSubPath.type = SubPath3D.TYPE_RECTANGLE;
        this.closePath();
    }

    ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
        if (radiusX < 0 || radiusY < 0) throw new Error('半径必须不小于0. Radius should not be smaller than zero. BanJing BiXu BuXiaoYu Ling');
        if (radiusX == 0 || radiusY == 0) return;
        if (anticlockwise == undefined) anticlockwise = false;

        let subpath = this.currentPath.lastSubPath;
        if (subpath == undefined) {
            subpath = new SubPath3D();
            this.currentPath.addSubPath(subpath);
        }

        startAngle = adjustAngle(startAngle);
        endAngle = adjustAngle(endAngle);

        if ((startAngle > endAngle && !anticlockwise) || (startAngle < endAngle && anticlockwise)) {
            if (startAngle < 0 || endAngle < 0) {
                endAngle -= 2 * Math.PI;
                if (endAngle == startAngle || Math.abs(endAngle - startAngle) <= Tools.EPSILON) endAngle -= 2 * Math.PI;
            }
            if (startAngle > 0 || endAngle > 0) {
                endAngle += 2 * Math.PI;
                if (endAngle == startAngle || Math.abs(endAngle - startAngle) <= Tools.EPSILON) endAngle += 2 * Math.PI;
            }
        }

        let realRadius = Math.max(radiusX, radiusY); // 这个值要根据当前缩放算一下
        let plusAngle = (Math.asin(1 / realRadius) * 2);
        let count = 0;
        if (anticlockwise) {
            plusAngle *= -1;
        }

        for (let radian = startAngle; Math.abs(radian) < Math.abs(endAngle); radian += plusAngle, count++) {
            let nextPoint = getPoint(x, y, radiusX, radiusY, radian);
            this.lineTo(nextPoint.x, nextPoint.y);
        }

        // 连接上最后一个点：
        let nextPoint = getPoint(x, y, radiusX, radiusY, endAngle);
        this.lineTo(nextPoint.x, nextPoint.y);

        function adjustAngle(angle) {
            let PI2 = 2 * Math.PI;
            let beishu = Math.floor(Math.abs(angle / PI2)) + 1;
            if (Math.abs(angle) > PI2) beishu++;
            if (angle < 0 && !anticlockwise) {
                angle += beishu * PI2;
            }
            if (angle > 0 && anticlockwise) {
                angle -= beishu * PI2;
            }
            return angle;
        }

        function getPoint(x, y, radiusX, radiusY, radian) {
            let cos = Math.cos(radian);
            let sin = Math.sin(radian);
            let tan = sin / cos;
            let x1 = Math.sqrt(radiusY * radiusY * radiusX * radiusX / ((radiusY * radiusY) + radiusX * radiusX * tan * tan));
            let y1 = tan * x1;
            if (cos * x1 < 0) x1 *= -1;
            if (sin * y1 < 0) y1 *= -1;
            x1 += x;
            y1 += y;
            if (rotation != 0) {
                let nx = ((x1 - x) * Math.cos(rotation)) - ((y1 - y) * Math.sin(rotation)) + x;
                let ny = ((y1 - y) * Math.cos(rotation)) + ((x1 - x) * Math.sin(rotation)) + y;
                x1 = nx;
                y1 = ny;
            }
            return {x: x1, y: y1};
        }
    }

    /**
     * 该方法已经在canvas2d下模拟测试通过
     * 规范说明
     * The arc(x, y, radius, startAngle, endAngle, counterclockwise) method draws an arc.
     * If the context has any subpaths, then the method must add a straight line from the last point in
     * the subpath to the start point of the arc. In any case, it must draw the arc between the start point of
     * the arc and the end point of the arc, and add the start and end points of the arc to the subpath.
     * The arc and its start and end points are defined as follows:
     * Consider a circle that has its origin at (x, y), and that has radius radius.
     * The points at startAngle and endAngle this circle's circumference, measured in radians clockwise
     * from the positive x-axis, are the start and end points respectively.
     * If the counterclockwise argument false and endAngle-startAngle is equal to or greater than 2π,
     * or if the counterclockwise argument is true and startAngle-endAngle is equal to or greater than 2π,
     * then the arc is the whole circumference of this circle.
     * Otherwise, the arc is the path along the circumference of this circle from the start point to the end point,
     * going anti-clockwise if the counterclockwise argument is true, and clockwise otherwise.
     * Since the points are on the circle, as opposed to being simply angles from zero,
     * the arc can never cover an angle greater than 2π radians.
     * If the two points are the same, or if the radius is zero, then the arc is defined as being of zero length in both directions.
     * Negative values for radius must cause the implementation to throw an IndexSizeError exception.
     * @param x
     * @param y
     * @param radius
     * @param startAngle
     * @param endAngle
     * @param anticlockwise
     */
    arc(x, y, radius, startAngle, endAngle, anticlockwise) {
        this.ellipse(x, y, radius, radius, 0, startAngle, endAngle, anticlockwise);
    }

    /*************************** sate **************************/

    /**
     * push state on state stack
     * 将当前状态放入状态栈中
     */
    save() {
        // 取出最后一个状态，克隆一个新状态，然后把新状态加入到栈内
        let currentState = this.currentContextState;
        let stateClone = currentState.clone();
        this[_stateStack].push(stateClone);
        this[_stateArray].push(stateClone);
        stateClone.id = this[_stateArray].length - 1;
    }

    /**
     * pop state stack and restore state
     * 将当前状态弹出栈，即恢复之前的状态
     */
    restore() {
        // 弹出栈底状态
        if (this[_stateStack].length != 0) {
            this[_stateStack].pop();
        }

    }

    translate(x, y, z) {
        this.currentContextState.translate(x, y, z);
    }

    /**
     * 默认2D是按照Z轴旋转
     * @param radian
     */
    rotate(radian) {
        this.currentContextState.rotateZ(radian);
    }

    rotateX(radian) {
        this.currentContextState.rotateX(radian);
    }

    rotateY(radian) {
        this.currentContextState.rotateY(radian);
    }

    scale(scaleX, scaleY, scaleZ) {
        this.currentContextState.scale(scaleX, scaleY, scaleZ);
    }

    /*********************** 绘制 *///////////////

    drawImage(image, srcX, srcY, srcWidth, srcHeight,
              dstX, dstY, dstWidth, dstHeight) {
        let texture = this.webglRender.textureManager.getTexture(image, this.gl, true);
        let action = new RenderAction(RenderAction.ACTION_FILL);
        action.textureIndex = texture.index;
        let left, top, right, bottom; // 图形对应矩形的四个点
        let tx, ty, tr, tb; // 贴图对应的四个点
        // 只有x,y传入的调用
        if (arguments.length == 3) {
            left = srcX;
            top = srcY;
            right = srcX + image.width;
            bottom = srcY + image.height;
            tx = texture.x;
            tr = (texture.x + texture.width);
            ty = texture.y;
            tb = (texture.y + texture.height);
        }
        // 有x,y,width,height传入的调用
        if (arguments.length == 5) {
            left = srcX;
            top = srcY;
            right = srcX + srcWidth;
            bottom = srcY + srcHeight;
            tx = texture.x;
            tr = (texture.x + texture.width);
            ty = texture.y;
            tb = (texture.y + texture.height);
        }
        // 有9个参数传入的调用，即要调整贴图做镖
        if (arguments.length == 9) {
            left = dstX;
            top = dstY;
            right = dstX + dstWidth;
            bottom = dstY + dstHeight;
            tx = (texture.x + srcX);
            tr = (texture.x + srcX + srcWidth);
            ty = (texture.y + srcY);
            tb = (texture.y + srcY + srcHeight);
        }
        this.beginPath();
        this.rect(left, top, right - left, bottom - top);

        let opacity = this.currentContextState.globalAlpha;
        let pathList = this[_pathList];
        this[_renderActionList].push(action);
        let texCoordArray = new Array(4);
        texCoordArray[0] = ([tx, ty]);// 左上角
        texCoordArray[1] = ([tr, ty]);// 右上角
        texCoordArray[2] = ([tr, tb]);// 右下角
        texCoordArray[3] = ([tx, tb]);// 左下角
        let color = [255, 255, 255]; //白色，在glsl里会成为一个1,1,1的向量，这样就不会改变贴图数据了
        action.collectVertexData(pathList, color, opacity, texCoordArray);
    }

    fill() {
        let fillColor = Color.getInstance().convertStringToColor(this.currentContextState.fillStyle);
        let opacity = this.currentContextState.globalAlpha;
        let pathList = this[_pathList];
        let action = new RenderAction(RenderAction.ACTION_FILL);
        this[_renderActionList].push(action);
        action.collectVertexData(pathList, fillColor, opacity, [0, 0]);
    }

    fillRect(x, y, w, h) {
        this.beginPath();
        this.rect(x, y, w, h);
        this.fill();
    }

    stroke() {
        let strokeColor = Color.getInstance().convertStringToColor(this.currentContextState.strokeStyle);
        let opacity = this.currentContextState.globalAlpha;
        let pathList = this[_pathList];
        let action = new RenderAction(RenderAction.ACTION_STROKE);
        this[_renderActionList].push(action);
        action.collectVertexData(pathList, strokeColor, opacity, [0, 0]);
    }

    //******************** 扩展接口 *****************************//

    fillEllipse() {

    }

    fillCircle(x, y, radius) {

    }

    draw() {
        this.webglRender.initRending();
        this.webglRender.executeRenderAction(this[_renderActionList], this[_stateArray]);
        this[_renderActionList].length = 0;
        // debug:
        console.log("绘制调用次数：", this.webglRender.DEBUG_DRAW_COUNT);
    }
}