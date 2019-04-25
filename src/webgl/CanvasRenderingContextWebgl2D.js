import ContextState from "./ContextState.js";
import CanvasDrawingStylesWebgl2D from "./CanvasDrawingStylesWebgl2D.js";
import Path3D from "./Path3D.js";
import SubPath3D from "./SubPath3D.js";
import Color from "../utils/Color.js";
import RenderAction from "./RenderAction.js";
import WebGLRender from "./WebGLRender.js";
import Tools from "../utils/Tools.js";
import Mat4 from "../math/Mat4.js";
import Vector3 from "../math/Vector3.js";
import GeometryTools from "../geometry/GeometryTools.js";
import Vector2 from "../math/Vector2.js";
import BMFontManager from "../font/BMFontManager.js";
import LineToRectangle from "../geometry/LineToRectangle.js";
import Texture from "../texture/Texture.js";
import Mat3 from "../math/Mat3.js";
import VDO from "./VDO.js";
import TempCanvas from "../texture/TempCanvas.js";
import TextTools from "../text/TextTools.js";

let _canvas = Symbol('对应的Canvas');
let _stateStack = Symbol('状态栈');
let _pathList = Symbol('路径列表');
let _renderActionList = Symbol('绘制动作List');
let _subpathCatch = Symbol('子Path缓存');


let TEMP_TRANFORM_MAT3 = Mat3.identity();

const SPACE_CHAR_ID = " ".charCodeAt(0);
const FACE_NORMAL4 = new Float32Array(4);
const ORI_NORMAL4 = new Float32Array(4);
const WHITE_COLOR = [255, 255, 255];
// let TEMP_VERTEX_COORD4DIM_ARRAY = [[0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1]];
let TEMP_VERTEX_COORD4DIM_ARRAY = [new Float32Array(4), new Float32Array(4), new Float32Array(4), new Float32Array(4)];
export default class CanvasRenderingContextWebgl2D {
    constructor(canvas, properties) {
        properties = properties || [];
        for (let i = 0; i < TEMP_VERTEX_COORD4DIM_ARRAY.length; i++) {
            // w要设为1
            TEMP_VERTEX_COORD4DIM_ARRAY[i][3] = 1;
        }
        FACE_NORMAL4[2] = 1;
        FACE_NORMAL4[3] = 1;
        ORI_NORMAL4[3] = 1;
        this[_canvas] = canvas;
        if (canvas == null) throw new Error('canvas can not be undefined or null');
        this.gl = canvas.getContext('webgl');
        if (this.gl == null) throw new Error('Current canvas doesnt support WebGL');
        this.maxBufferByteLength = properties['maxMemorySize'] || 1024 * 1024;
        this[_stateStack] = [];
        this[_pathList] = [];
        this[_renderActionList] = [];
        this[_subpathCatch] = [];
        this._tempCanvas = new TempCanvas();
        properties.tempCanvas = this._tempCanvas;
        this.webglRender = new WebGLRender(this.gl, properties);
        let maxVertexNumber = this.maxBufferByteLength / 32;
        this._mixOpacity = properties['mixOpacity'];// 这个属性是规定是否要让vdo对象将透明和不透明分开
        if (this._mixOpacity == null) this._mixOpacity = false;

        this.vdo = new VDO(maxVertexNumber, maxVertexNumber, this._mixOpacity);

        this.webglRender.vdo = this.vdo;
        this.currentFaceNormal = new Float32Array(4);
        this.originalFaceNormal = new Float32Array(3);
        this.originalFaceNormal[2] = 1;
        this.currentFaceNormal[2] = 1;
        this._tempPathArray = null;
        this._tempActionList = null;
        this._tempGraphics = null;
        this._painedGraphicsMap = {};
        this.fontManager = new BMFontManager();

        this._tempVDO = null;
    }

    get defaultDepth() {
        return this.webglRender.defaultDepth;
    }

    get currentContextState() {
        if (this[_stateStack].length == 0) { // 状态栈永远不为空
            let state = new ContextState(new CanvasDrawingStylesWebgl2D());
            this[_stateStack].push(state);
        }
        return this[_stateStack][this[_stateStack].length - 1];
    }

    get currentPath() {
        if (this[_pathList].length == 0) {
            this[_pathList].push(new Path3D());
        }
        return this[_pathList][this[_pathList].length - 1];
    }

    get renderActionList() {
        return this[_renderActionList];
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

    get cameraPosition() {
        return this.webglRender.cameraPosition;
    }

    get lookAtTarget() {
        return this.webglRender.lookTarget;
    }

    get currentFaceVector() {
        let m = this.currentContextState.transformMatrix;
        Mat4.mat4ToMat3(m, TEMP_TRANFORM_MAT3);
        Mat3.multiplyWithVertex(this.currentFaceNormal, TEMP_TRANFORM_MAT3, this.originalFaceNormal);
        return this.currentFaceNormal;
    }

    get fontWeight() {
        return this.currentContextState.canvasDrawingStyle.fontWeight;
    }

    set fontWeight(v) {
        this.currentContextState.canvasDrawingStyle.fontWeight = v;
    }

    get fontStyle() {
        return this.currentContextState.canvasDrawingStyle.fontStyle;
    }

    set fontStyle(v) {
        this.currentContextState.canvasDrawingStyle.fontStyle = v;
    }

    get fontFamily() {
        return this.currentContextState.canvasDrawingStyle.fontFamily;
    }

    set fontFamily(font) {
        this.currentContextState.canvasDrawingStyle.fontFamily = font;
    }

    get fontSize() {
        return this.currentContextState.canvasDrawingStyle.fontSize;
    }

    set fontSize(size) {
        this.currentContextState.canvasDrawingStyle.fontSize = size;
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

    /**
     * set stroke lineWidth
     * 设置stroke时的线宽度
     * @param lineWidth
     */
    set lineWidth(lineWidth) {
        this.currentContextState.lineWidth = lineWidth;
    }

    get lineWidth() {
        return this.currentContextState.lineWidth;
    }

    get textAlign() {
        return this.currentContextState.textAlign;
    }

    set textAlign(textAlign) {
        this.currentContextState.textAlign = textAlign;
    }

    get textBaseline() {
        return this.currentContextState.textBaseline;
    }

    set textBaseline(textBaseline) {
        this.currentContextState.textBaseline = textBaseline;
    }

    /**
     * clean all the path content and clear webgl depth buffer/color buffer
     */
    clean(clearAllTexture) {
        this[_pathList].length = 0;
        this.webglRender.clean(clearAllTexture);
    }

    /**
     * didn't implement , just clear whole canvas
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


    beginPath() {
        this.currentPath.clean();
    }

    closePath() {
        let path = this.currentPath;
        if (path.subPathNumber == 0) return;
        let lastSubPath = path.lastSubPath;
        lastSubPath.close();
        let x = lastSubPath.getPointX(0);
        let y = lastSubPath.getPointX(0);
        let z = lastSubPath.getPointX(0);
        let sid = lastSubPath.getPointStateId(0);
        // let mid = lastSubPath.getPointMatrixId(0);
        let newSubPath = new SubPath3D();
        newSubPath.addPoint(x, y, z, sid);
        path.addSubPath(newSubPath);
    }

    lineTo(x, y, z) {
        if (z == undefined) z = 0;
        let currentSubPath = this.currentPath;
        let lastSubPath = currentSubPath.lastSubPath;
        if (lastSubPath == undefined) {
            let subPath = new SubPath3D();
            currentSubPath.addSubPath(subPath);
            this.addPointInLastSubPath(x, y, z, true);
            return;
        }
        this.addPointInLastSubPath(x, y, z, true);
    }

    addPointInPath(x, y, z, path, applyTransform) {
        let currentState = this.currentContextState;
        let m = currentState.transformMatrix;
        if (applyTransform && !Mat4.isIdentity(m)) {
            let tempVector = TEMP_VERTEX_COORD4DIM_ARRAY[0];
            tempVector[0] = x;
            tempVector[1] = y;
            tempVector[2] = z;
            tempVector[3] = 1;
            Mat4.multiplyWithVertex(m, tempVector, tempVector);
            x = tempVector[0];
            y = tempVector[1];
            z = tempVector[2];
            // currentState.fireDirty();
        }
        path.addPoint(x, y, z, currentState.id)
    }

    addPointInLastSubPath(x, y, z, applyTransform) {
        this.addPointInPath(x, y, z, this.currentPath.lastSubPath, applyTransform);
    }

    moveTo(x, y, z) {
        if (z == undefined) z = 0;
        let currentState = this.currentContextState;
        let currentSubPath = this.currentPath;
        let lastSubPath = currentSubPath.lastSubPath;
        if (lastSubPath != undefined && lastSubPath.pointsNumber < 2) {
            //这个subpath只要一个点，就用它作为新的subpath
            let m = currentState.transformMatrix;
            let tempVector = TEMP_VERTEX_COORD4DIM_ARRAY[0];
            tempVector[0] = x;
            tempVector[1] = y;
            tempVector[2] = z;
            tempVector[3] = 1;
            let temp = Mat4.multiplyWithVertex(m, tempVector, tempVector);
            if (lastSubPath.pointsNumber != 0) {
                lastSubPath.setPoint(0, temp[0], temp[1], temp[2], currentState.id);
            } else {
                lastSubPath.addPoint(temp[0], temp[1], temp[2], currentState.id);
            }

        } else {
            let subPath = new SubPath3D();
            currentSubPath.addSubPath(subPath);
            this.addPointInLastSubPath(x, y, z, true);
        }
    }

    rect(x, y, w, h, depth) {
        if (depth == undefined) depth = 0;
        this.moveTo(x, y, depth);
        this.lineTo(x + w, y, depth);
        this.lineTo(x + w, y + h, depth);
        this.lineTo(x, y + h, depth);
        this.closePath();
    }

    /**
     * 绘制cubic贝塞尔曲线，4个控制点
     * @param cp1x
     * @param cp1y
     * @param cp2x
     * @param cp2y
     * @param x
     * @param y
     */
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
        let oldx = cp1x;
        let oldy = cp1y;
        let currentPath = this.currentPath;
        let currentState = this.currentContextState;
        let lastSubPath = currentPath.lastSubPath;
        let tempVector = TEMP_VERTEX_COORD4DIM_ARRAY[0];
        let defaultZ = 0;

        tempVector[0] = cp1x;
        tempVector[1] = cp1y;
        tempVector[2] = 0;
        tempVector[3] = 1;
        let m1 = this.currentContextState.transformMatrix;
        Mat4.multiplyWithVertex(m1, tempVector, tempVector);
        cp1x = tempVector[0];
        cp1y = tempVector[1];
        defaultZ = tempVector[2];

        tempVector[0] = cp2x;
        tempVector[1] = cp2y;
        tempVector[2] = 0;
        tempVector[3] = 1;
        Mat4.multiplyWithVertex(m1, tempVector, tempVector);
        cp2x = tempVector[0];
        cp2y = tempVector[1];

        tempVector[0] = x;
        tempVector[1] = y;
        tempVector[2] = 0;
        tempVector[3] = 1;
        Mat4.multiplyWithVertex(m1, tempVector, tempVector);
        x = tempVector[0];
        y = tempVector[1];

        let cp0x = cp1x;
        let cp0y = cp1y;

        if (lastSubPath == undefined) {
            this.moveTo(oldx, oldy);
        } else {
            let lastIndex = lastSubPath.pointsNumber - 1;
            let x0 = lastSubPath.getPointX(lastIndex);
            let y0 = lastSubPath.getPointY(lastIndex);
            if (x0 != cp1x && y0 != cp1y) {
                cp0x = x0;
                cp0y = y0;
            }
        }
        // 一阶导数：3(1-t)^2(p1-p0) + 6t(1-t)(p2-p1)+3t^2(p3-p2)
        let minLength = 1;
        let delta = 9 * (cp1x - cp0x) * (cp1x - cp0x) + 9 * (cp1y - cp0y) * (cp1y - cp0y);
        delta = Math.sqrt(minLength / delta);
        if (delta === Infinity) delta = 0.01;
        let temp = TEMP_VERTEX_COORD4DIM_ARRAY[0];
        let segment = delta;
        for (; segment <= 1; segment += delta) {
            GeometryTools.cubicBezier(segment, cp0x, cp0y, cp1x, cp1y, cp2x, cp2y, x, y, temp);
            this.addPointInLastSubPath(temp[0], temp[1], defaultZ, false);
            let c = 1 - segment;
            let p1 = 3 * c * c;
            let p2 = 6 * segment * c;
            let p3 = 3 * segment * segment;
            let a = p1 * (cp1x - cp0x) + p2 * (cp2x - cp1x) + p3 * (x - cp2x);
            let b = p1 * (cp1y - cp0y) + p2 * (cp2y - cp1y) + p3 * (y - cp2y);
            delta = minLength / (a * a + b * b);
            delta = Math.sqrt(delta);
        }
        this.addPointInLastSubPath(x, y, defaultZ, false);
        // currentState.fireDirty();
    }

    /**
     * 绘制Quadratice贝塞尔，3个控制点
     * @param cpx
     * @param cpy
     * @param x
     * @param y
     */
    quadraticCurveTo(cpx, cpy, x, y) {
        let currentPath = this.currentPath;
        let currentState = this.currentContextState;
        let lastSubPath = currentPath.lastSubPath;
        let m = TEMP_VERTEX_COORD4DIM_ARRAY[0];
        m[0] = cpx;
        m[1] = cpy;
        m[2] = 0;
        m[3] = 1;
        let m1 = this.currentContextState.transformMatrix;
        Mat4.multiplyWithVertex(m1, m, m);
        cpx = m[0];
        cpy = m[1];
        let cpz = m[2];
        m[0] = x;
        m[1] = y;
        m[2] = 0;
        m[3] = 1;
        Mat4.multiplyWithVertex(m1, m, m);
        x = m[0];
        y = m[1];
        let z = m[2];

        let cp0x = cpx;
        let cp0y = cpy;

        if (lastSubPath == undefined) {
            let subPath = new SubPath3D();
            currentPath.addSubPath(subPath);
            this.addPointInLastSubPath(cpx, cpy, cpz, false);
        } else {
            let lastIndex = lastSubPath.pointsNumber - 1;
            let x0 = lastSubPath.getPointX(lastIndex);
            let y0 = lastSubPath.getPointY(lastIndex);
            if (x0 != cpx && y0 != cpy) {
                cp0x = x0;
                cp0y = y0;
            }
        }
        if (cp0x == cpx && cp0y == cpy) {
            this.addPointInLastSubPath(x, y, z, false);
            return;
        }
        // 一阶导数：2(1-t)(p1-p0) + 2t(p2-p1)
        let minLength = 1;
        let delta = minLength / (4 * (cpx - cp0x) * (cpx - cp0x) + 4 * (cpy - cp0y) * (cpy - cp0y));
        delta = Math.sqrt(delta);
        if (delta === Infinity) delta = 0.01;
        let temp = TEMP_VERTEX_COORD4DIM_ARRAY[0];
        let segment = delta;
        for (; segment <= 1; segment += delta) {
            GeometryTools.quadraticBezier(segment, cp0x, cp0y, cpx, cpy, x, y, temp);
            this.addPointInLastSubPath(temp[0], temp[1], cpz, false);
            let p1 = 2 * (1 - segment);
            let p2 = 2 * segment;
            let a = p1 * (cpx - cp0x) + p2 * (x - cpx);
            let b = p1 * (cpy - cp0y) + p2 * (y - cpy);
            delta = minLength / (a * a + b * b);
            delta = Math.sqrt(delta);
        }
        this.addPointInLastSubPath(x, y, z, false);
        // currentState.fireDirty();
    }

    // 没有实现这个椭圆的：arcTo(x1: number, y1: number, x2: number, y2: number, radiusX: number, radiusY: number, rotation: number): void;
    /**
     * FIXME 这个方法有个bug，path中的最后一个点所应用的转换矩阵不一定就是当前矩阵
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @param radius
     */
    arcTo(x1, y1, x2, y2, radius) {
        if (radius < 0) throw new Error('IndexError: Radius value wrong');
        let subpath = this.currentPath.lastSubPath;
        let startx = 0;
        let starty = 0;
        if (subpath == undefined) {
            subpath = new SubPath3D();
            this.currentPath.addSubPath(subpath);
            this.moveTo(x1, y1);
            return;
        } else {
            let sx = subpath.getPointX(subpath.pointsNumber - 1);
            let sy = subpath.getPointY(subpath.pointsNumber - 1);
            let sz = subpath.getPointZ(subpath.pointsNumber - 1);
            let testVertex = TEMP_VERTEX_COORD4DIM_ARRAY[0];
            testVertex[0] = sx;
            testVertex[1] = sy;
            testVertex[2] = sz;
            testVertex[3] = 1;
            let tm = this.currentContextState.transformMatrix;
            let tempM = Mat4.TEMP_MAT4[0];
            Mat4.copy(tm, tempM);
            Mat4.inverse(tempM, tempM);
            Mat4.multiplyWithVertex(tempM, testVertex, testVertex);
            if ((Tools.equals(sx, x1) && Tools.equals(sy, y1)) ||
                (Tools.equals(x1, x2) && Tools.equals(y1, y2)) ||
                radius == 0) {
                this.lineTo(x1, y1);
                return;
            }
            startx = testVertex[0];
            starty = testVertex[1];
        }

        let vector1 = new Vector2(startx - x1, starty - y1);
        let vector2 = new Vector2(x2 - x1, y2 - y1);

        Vector2.normalize(vector1, vector1);
        Vector2.normalize(vector2, vector2);

        let vector3 = new Vector2();
        Vector2.plus(vector3, vector1, vector2);
        Vector2.normalize(vector3, vector3);
        let radian1 = Math.acos(Vector2.dot(vector1, vector3));
        if (Tools.equals(radian1 * 2 % Math.PI, 0)) {
            this.lineTo(x1, y1);
            return;
        }
        let sin = Math.sin(radian1);
        let length2 = radius / sin;

        let rx = vector3.x * length2 + x1;
        let ry = vector3.y * length2 + y1;


        let center = {x: rx, y: ry};
        let linep1 = {x: x1, y: y1};
        let linep2 = {x: startx, y: starty};
        let linep3 = {x: x2, y: y2};
        let tangenp1 = GeometryTools.getProjectionPointOnLine(center, linep1, linep2);
        let tangenp2 = GeometryTools.getProjectionPointOnLine(center, linep1, linep3);
        let tv1 = new Vector2(tangenp1.x - rx, tangenp1.y - ry);
        let tv2 = new Vector2(tangenp2.x - rx, tangenp2.y - ry);
        Vector2.normalize(tv1, tv1);
        Vector2.normalize(tv2, tv2);

        function adjustAngle(angle) {
            let PI2 = 2 * Math.PI;
            let beishu = Math.floor(Math.abs(angle / PI2));
            // if (Math.abs(angle) > PI2) beishu++;
            if (angle < 0) {
                angle += beishu * PI2;
            }
            if (angle >= PI2) {
                angle -= beishu * PI2;
            }
            return angle;
        }

        let startTheta = Math.atan2(tv1.y, tv1.x);
        let testst = startTheta;
        testst = adjustAngle(testst);
        let endTheta = Math.atan2(tv2.y, tv2.x);
        let testet = endTheta;
        testet = adjustAngle(testet);
        let flag = false;
        if (Math.abs((testst - testet)) > Math.PI) {
            flag = true;
        }
        this.arc(rx, ry, radius, startTheta, endTheta, flag);
    }

    getEllipseCalculateTempMatrix(x, y, z, radiusX, radiusY, rotation, tm) {
        let currentMatrix = Mat4.identity();
        Mat4.translationMatrix(currentMatrix, x, y, z);
        Mat4.multiply(currentMatrix, tm, currentMatrix);
        let transformMatrix = Mat4.TEMP_MAT4[0];
        Mat4.rotationZMatrix(transformMatrix, rotation);
        Mat4.multiply(currentMatrix, currentMatrix, transformMatrix);
        /*
        * 设一个矩阵：
        * [ radiusX,0,0,0
        *  0, radiusY,0,0
        *  0,0,1,0
        *  0,0,0,1]
        */
        Mat4.identityMatrix(transformMatrix);
        transformMatrix[0] = radiusX;
        transformMatrix[5] = radiusY;
        Mat4.multiply(currentMatrix, currentMatrix, transformMatrix);
        return currentMatrix;
    }

    ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
        if (radiusX < 0 || radiusY < 0) throw new Error('IndexError.半径必须不小于0. Radius should not be smaller than zero. BanJing BiXu BuXiaoYu Ling');
        if (radiusX == 0 || radiusY == 0) return;
        if (anticlockwise == null) anticlockwise = false;

        let subpath = this.currentPath.lastSubPath;
        if (subpath == null) {
            subpath = new SubPath3D();
            this.currentPath.addSubPath(subpath);
        }
        let tm = this.currentContextState.transformMatrix;
        let currentMatrix = this.getEllipseCalculateTempMatrix(x, y, 0, radiusX, radiusY, rotation, tm);//Mat4.TEMP_MAT4[0];

        let realRadius1 = Math.max(radiusX * this.currentContextState.scaleValue.x, radiusY * this.currentContextState.scaleValue.y); // 这个值要根据当前缩放算一下
        let deltaTheta = (Math.asin(1 / realRadius1) * 2);

        let thetaVector = new Vector3();

        startAngle = this.adjustEllipseAngle(startAngle, anticlockwise);
        endAngle = this.adjustEllipseAngle(endAngle, anticlockwise);

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
        /**
         * 把椭圆点的计算抽取出来，形成了几个矩阵，然后先让这些矩阵和当前变换矩阵相乘
         * 再通过已经应用了变换后的矩阵计算坐标点，这样省去了用lineTo一个一个点和矩阵相乘
         */
        if (anticlockwise) {
            for (let theta = startAngle; theta > endAngle; theta -= deltaTheta) {
                if (Math.abs(theta - startAngle) >= Tools.PI2) {
                    return;
                }
                let s = Math.sin(theta);
                let c = Math.cos(theta);
                thetaVector.x = c;
                thetaVector.y = s;
                thetaVector.z = 0;
                Mat4.multiplyWithVertex(currentMatrix, thetaVector.value, thetaVector.value);
                this.addPointInLastSubPath(thetaVector.x, thetaVector.y, thetaVector.z, false)
            }
        } else {
            for (let theta = startAngle; theta < endAngle; theta += deltaTheta) {
                if (Math.abs(theta - startAngle) >= Tools.PI2) {
                    return;
                }

                let s = Math.sin(theta);
                let c = Math.cos(theta);
                thetaVector.x = c;
                thetaVector.y = s;
                thetaVector.z = 0;
                Mat4.multiplyWithVertex(currentMatrix, thetaVector.value, thetaVector.value);
                this.addPointInLastSubPath(thetaVector.x, thetaVector.y, thetaVector.z, false)
                // 老的计算方法是先计算坐标后再进行变换：(lineTo会自动将点进行变换)
                // GeometryTools.getEllipsePointWithRadian(x, y, radiusX, radiusY, theta, rotation, nextPoint);
                // this.lineTo(nextPoint[0], nextPoint[1]);
            }
        }

        let s = Math.sin(endAngle);
        let c = Math.cos(endAngle);
        thetaVector.x = c;
        thetaVector.y = s;
        thetaVector.z = 0;
        Mat4.multiplyWithVertex(currentMatrix, thetaVector.value, thetaVector.value);
        this.addPointInLastSubPath(thetaVector.x, thetaVector.y, thetaVector.z, false)
    }

    adjustEllipseAngle(angle, anticlockwise) {
        let PI2 = Tools.PI2;//2 * Math.PI;
        let beishu = Math.floor(Math.abs(angle / PI2)) + 1;
        // if (Math.abs(angle) > PI2) beishu++;
        if (angle < 0 && !anticlockwise) {
            angle += beishu * PI2;
        }
        if (angle > 0 && anticlockwise) {
            angle -= beishu * PI2;
        }
        return angle;
    }

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

    /**
     *
     * @param scaleX :number
     * @param skewY:number
     * @param skewX:number
     * @param scaleY:number
     * @param tx:number
     * @param ty:number
     */
    setTransform(scaleX, skewY, skewX, scaleY, tx, ty) {
        Mat4.identityMatrix(this.currentContextState.transformMatrix);
        let m = this.currentContextState.transformMatrix;
        m[0] = scaleX;
        m[1] = skewY;
        m[4] = skewX;
        m[5] = scaleY;
        m[12] = tx;
        m[13] = ty;
        m[14] = 0;
    }

    /**
     * 给出一个转换矩阵数据，可以执行：拉伸，倾斜，移动
     * @param scaleX 横向拉伸 :number
     * @param skewY 纵向倾斜 :number
     * @param skewX 横向倾斜:number
     * @param scaleY 纵向拉伸:number
     * @param tx 横向移动:number
     * @param ty 纵向移动:number
     */
    transform(scaleX, skewY, skewX, scaleY, tx, ty) {
        let m = Mat4.TEMP_MAT4[0];
        Mat4.identityMatrix(m);
        /* 矩阵是这样的：
          [ a,c,e
            b,d,f,
            0,0,1 ]
            对应我自己的4x4矩阵是：
            a,b,0,0
            c,d,0,0
            0,0,1,0
            e,f,0,1
         */
        m[0] = scaleX;
        m[1] = skewY;
        m[4] = skewX;
        m[5] = scaleY;
        m[12] = tx;
        m[13] = ty;
        this.currentContextState.applyTransform(m);
    }

    applyTransformMatrix(matrix) {
        this.currentContextState.applyTransform(matrix);
    }

    /*********************** 绘制 *///////////////


    drawDynamicImage(image, srcX, srcY, srcWidth, srcHeight,
                     dstX, dstY, dstWidth, dstHeight, depth, color) {
        depth = depth || 0;
        let texture;
        if (image instanceof Texture) {
            texture = image;
        } else {
            texture = this.webglRender.textureManager.getTexture(image, null, true);
        }
        let action = new RenderAction(RenderAction.ACTION_FILL);
        action.textureIndex = texture.index;
        let left, top, right, bottom; // 图形对应矩形的四个点
        let tx, ty, tr, tb; // 贴图对应的四个点
        // 只有x,y传入的调用
        if (arguments.length === 3) {
            left = srcX;
            top = srcY;
            right = srcX + image.width;
            bottom = srcY + image.height;
            tx = texture.x;
            tr = (texture.x + texture.width);
            ty = texture.y;
            tb = (texture.y + texture.height);
        }
        if (arguments.length === 4) {
            left = srcX;
            top = srcY;
            right = srcX + image.width;
            bottom = srcY + image.height;
            tx = texture.x;
            tr = (texture.x + texture.width);
            ty = texture.y;
            tb = (texture.y + texture.height);
            depth = srcWidth;
        }
        // 有x,y,width,height传入的调用
        if (arguments.length === 5) {
            left = srcX;
            top = srcY;
            right = srcX + srcWidth;
            bottom = srcY + srcHeight;
            tx = texture.x;
            tr = (texture.x + texture.width);
            ty = texture.y;
            tb = (texture.y + texture.height);
        }
        if (arguments.length === 6) {
            left = srcX;
            top = srcY;
            right = srcX + srcWidth;
            bottom = srcY + srcHeight;
            tx = texture.x;
            tr = (texture.x + texture.width);
            ty = texture.y;
            tb = (texture.y + texture.height);
            depth = dstX;
        }
        // 有9或10个参数传入的调用，即要调整贴图坐标
        if (arguments.length === 9 || arguments.length === 10 || arguments.length === 11) {
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
        this.rect(left, top, right - left, bottom - top, depth);
        this.currentPath.subPathArray[this.currentPath.subPathNumber - 2].isRegularRect = true;
        let opacity = this.currentContextState.globalAlpha;
        let pathList = this[_pathList];
        this[_renderActionList].push(action);
        let texCoordArray = new Array(4);
        texCoordArray[0] = ([tx, ty]);// 左上角
        texCoordArray[1] = ([tr, ty]);// 右上角
        texCoordArray[2] = ([tr, tb]);// 右下角
        texCoordArray[3] = ([tx, tb]);// 左下角
        color = color || WHITE_COLOR; //白色，在glsl里会成为一个1,1,1的向量，这样就不会改变贴图数据了
        action.vdo = this.vdo;
        action.collectVertexDataForFill(pathList, color, opacity, texCoordArray, this.currentContextState.filterType
            , this.currentFaceVector, texture.opacity);
    }

    drawImage(image, srcX, srcY, srcWidth, srcHeight,
              dstX, dstY, dstWidth, dstHeight, depth, color) {

        let texture;
        if (image instanceof Texture) {
            texture = image;
        } else {
            texture = this.webglRender.textureManager.getTexture(image);
        }
        let action = new RenderAction(RenderAction.ACTION_FILL);
        action.textureIndex = texture.index;
        let left, top, right, bottom; // 图形对应矩形的四个点
        let tx, ty, tr, tb; // 贴图对应的四个点
        // 只有x,y传入的调用
        if (arguments.length === 3 || arguments.length === 4) {
            left = srcX;
            top = srcY;
            right = srcX + image.width;
            bottom = srcY + image.height;
            tx = texture.x;
            tr = (texture.x + texture.width);
            ty = texture.y;
            tb = (texture.y + texture.height);
            depth = srcWidth;
        }
        // 有x,y,width,height传入的调用
        if (arguments.length === 5 || arguments.length === 6) {
            left = srcX;
            top = srcY;
            right = srcX + srcWidth;
            bottom = srcY + srcHeight;
            tx = texture.x;
            tr = (texture.x + texture.width);
            ty = texture.y;
            tb = (texture.y + texture.height);
            depth = dstX;
        }
        // 有9或10个参数传入的调用，即要调整贴图坐标
        if (arguments.length >= 9) {
            left = dstX;
            top = dstY;
            right = dstX + dstWidth;
            bottom = dstY + dstHeight;
            tx = (texture.x + srcX);
            tr = (texture.x + srcX + srcWidth);
            ty = (texture.y + srcY);
            tb = (texture.y + srcY + srcHeight);
        }

        depth = depth || 0;

        this.beginPath();
        this.rect(left, top, right - left, bottom - top, depth);
        this.currentPath.subPathArray[this.currentPath.subPathNumber - 2].isRegularRect = true;
        let opacity = this.currentContextState.globalAlpha;
        let pathList = this[_pathList];
        this[_renderActionList].push(action);
        let texCoordArray = new Array(4);
        texCoordArray[0] = ([tx, ty]);// 左上角
        texCoordArray[1] = ([tr, ty]);// 右上角
        texCoordArray[2] = ([tr, tb]);// 右下角
        texCoordArray[3] = ([tx, tb]);// 左下角
        color = color || WHITE_COLOR; //白色，在glsl里会成为一个1,1,1的向量，这样就不会改变贴图数据了
        action.vdo = this.vdo;
        if (color != WHITE_COLOR) {
            color = Color.getInstance().convertStringToColor(color);
        }
        action.collectVertexDataForFill(pathList, color, opacity, texCoordArray, this.currentContextState.filterType
            , this.currentFaceVector, texture.opacity);
    }


    fill() {
        let fillColor = Color.getInstance().convertStringToColor(this.currentContextState.fillStyle);
        let opacity = this.currentContextState.globalAlpha;
        let pathList = this[_pathList];
        let action = new RenderAction(RenderAction.ACTION_FILL);
        action.vdo = this.vdo;
        // let vdo = this.getVDOArrays();
        // action.verticesData = vdo.verticesData;
        // action.fragmentData = vdo.fragmentData;
        // action.indexData = vdo.indexData;
        this[_renderActionList].push(action);
        action.collectVertexDataForFill(pathList, fillColor, opacity * fillColor[3], [0, 0],
            this.currentContextState.filterType, this.currentFaceVector);
    }

    measureBMText(text, bmfont) {
        if (bmfont == null) {
            let font = this.fontFamily;
            font = font.trim().toLocaleLowerCase();
            bmfont = this.fontManager.getBMFont(font);
            if (bmfont == null) {
                throw new Error('TieLiFa can not find the font:' + font + ',you can register the BM Font with API');
            }
        }
        let string = text;
        let width = 0;
        let fontSize = this.fontSize;
        let scale = fontSize / bmfont.size;
        let spaceChar = bmfont.chars[" ".charCodeAt(0)];
        for (let i = 0; i < string.length; i++) {
            let id = string.charCodeAt(i);
            let c = bmfont.chars[id];
            if (c == undefined) {
                width += spaceChar.xadvance;
                continue;
            }
            width += c.xadvance;
        }
        return {width: width * scale};
    }

    /**
     * FIXME 测量结果和实际生成的texture宽度总和是有误差的，这个要改改
     * @param text
     * @returns {{}}
     */
    measureText(text) {
        let canvas = this._tempCanvas;
        return TextTools.measureText(canvas, text, this.fontSize, this.fontFamily, this.fontWeight, this.fontStyle);
    }

    fillTextWithBMFont(text, x, y, maxWidth, depth, bmfont) {
        if (bmfont == null) {
            let font = this.fontFamily;
            font = font.trim().toLocaleLowerCase();
            bmfont = this.fontManager.getBMFont(font);
        }

        let string = text;
        let fontSize = this.fontSize;
        let scale = fontSize / bmfont.size;
        let base = bmfont.common.base;
        this.save();
        this.translate(x, y);
        this.scale(scale, scale);
        this.translate(-x, -y);
        let fillColor = Color.getInstance().convertStringToColor(this.currentContextState.fillStyle);
        let textBase = this.textBaseline;
        let textAlign = this.textAlign;
        let totalWidth = this.measureBMText(text, bmfont);
        let sw = 1;
        let realWidth = totalWidth.width;
        if ((maxWidth != null) && (maxWidth < totalWidth.width)) {
            if (maxWidth == 0) return;
            sw = maxWidth / totalWidth.width;
            realWidth = maxWidth;
        }
        if (textAlign == 'end' || textAlign == 'right') {
            x -= realWidth / scale;
        }
        if (textAlign == 'center') {
            x -= realWidth / scale / 2;
        }
        if (textBase == 'top') {

        }
        if (textBase == 'bottom') {
            y -= fontSize / scale;
        }
        if (textBase == 'middle') {
            y -= (fontSize / 2) / scale;
        }

        let spaceChar = bmfont.chars[SPACE_CHAR_ID];
        for (let i = 0; i < string.length; i++) {
            let id = string.charCodeAt(i);
            let c = bmfont.chars[id];
            if (c == undefined) {
                x += spaceChar.xadvance * sw;
                continue;
            }
            let h = c.height;
            let w = c.width;
            w *= sw;
            let img = this.fontManager.getFontImage(font, c.page);
            if (img == null || img == undefined) continue;
            if (id != SPACE_CHAR_ID) {
                this.drawImage(img, c.x, c.y, c.width, c.height,
                    x + c.xoffset * sw, y + c.yoffset, w, h, depth, fillColor);
            }
            x += c.xadvance * sw;
        }
        this.restore();
    }

    /**
     * FIXME italic类型的字符绘制会出现显示不全，这是因为生成的texture宽度没有计算正确。就算计算正确了也没有解决每个字符之间的间距问题
     * @param text
     * @param x
     * @param y
     * @param maxWidth
     * @param depth
     */
    fillText(text, x, y, maxWidth, depth) {
        if (depth == null) depth = 0;
        let textureManager = this.webglRender.textureManager;
        let string = text;
        let fontMetrics = TextTools.measureFont(this._tempCanvas, this.fontFamily, this.fontWeight, this.fontStyle);
        let lineMaxWidth = 0;
        let stringArray = TextTools.splitTextWithNewlineChar(string);
        let lineArray = [];
        for (let i = 0; i < stringArray.length; i++) {
            let line = {lineWidth: 0, textures: [], scale: 1};
            lineArray.push(line);
            let s = stringArray[i];
            for (let j = 0; j < s.length; j++) {
                let code = s.charCodeAt(j);

                if (TextTools.isNewLineChar(code)) {
                    code = TextTools.SPACE_CHAR_CODE;
                }
                if (TextTools.isSpacesChar(code)) {
                    let spaceWidth = fontMetrics.spaceCharWidthCent[code] * this.fontSize;
                    line.lineWidth += Math.floor(spaceWidth); //之前的计算都是四舍五入，这里截断，有可能会缩小误差哟
                    line.textures.push(spaceWidth);
                    continue;
                }

                let char = String.fromCharCode(code);
                let textureId = char + "@" + fontMetrics.id + "_" + this.fontSize.toString();
                let texture = textureManager.getTextureById(textureId);
                if (texture == null) {
                    let canvas = this._tempCanvas;
                    TextTools.draw2dText(canvas, char, this.fontSize, this.fontFamily, this.fontWeight, this.fontStyle);
                    texture = textureManager.createTexture(canvas, textureId);
                }
                line.textures.push(texture);
                line.lineWidth += texture.width;
            }
            lineMaxWidth = Math.max(lineMaxWidth, line.lineWidth);
        }
        if (maxWidth != null) {
            if (lineMaxWidth > maxWidth) {
                lineMaxWidth = maxWidth;
            }
        }
        let lineHeight = Math.ceil(fontMetrics.fontSize * this.fontSize);
        let baseLine = this.textBaseline;
        let textAlign = this.textAlign;
        let totalHeight = lineArray.length * lineHeight;

        let startX = x;
        let startY = y;
        let sx = startX;
        let sy = startY;
        for (let i = 0; i < lineArray.length; i++) {
            let line = lineArray[i];
            let lineWidth = line.lineWidth;
            if (maxWidth != null) {
                if (maxWidth < lineWidth) {
                    line.scale = maxWidth / lineWidth;
                    lineWidth = maxWidth;
                }
            }
            sx = startX;
            sy = y + lineHeight * i;
            let offset = TextTools.getStartPointOffset(baseLine, textAlign, this.fontSize,
                fontMetrics, lineWidth);
            sx += offset.x;
            sy += offset.y;
            for (let k = 0; k < line.textures.length; k++) {
                let t = line.textures[k];
                if (t instanceof Texture) {
                    let w = t.width * line.scale;
                    this.drawImage(t, 0, 0, t.width, t.height,
                        sx, sy, w, t.height,
                        depth, this.fillStyle);
                    sx += w;
                } else {
                    sx += t * line.scale;
                }
            }
        }
    }

    fillRect(x, y, w, h, depth) {
        depth = depth || 0;
        this.beginPath();
        this.rect(x, y, w, h, depth);
        this.currentPath.subPathArray[this.currentPath.subPathNumber - 2].isRegularRect = true;
        this.fill();
    }


    strokeRect(x, y, w, h, depth) {
        depth = depth || 0;
        this.beginPath();
        this.rect(x, y, w, h, depth);
        this.stroke();
    }

    stroke() {
        let strokeColor = Color.getInstance().convertStringToColor(this.currentContextState.strokeStyle);
        let opacity = this.currentContextState.globalAlpha;
        let pathList = this[_pathList];
        let lineWidth = this.currentContextState.lineWidth;
        let filterType = this.currentContextState.filterType;
        let action = new RenderAction(RenderAction.ACTION_FILL);
        action.vdo = this.vdo;
        // let vdo = this.getVDOArrays();
        // action.verticesData = vdo.verticesData;
        // action.fragmentData = vdo.fragmentData;
        // action.indexData = vdo.indexData;
        this[_renderActionList].push(action);
        action.collectVertexDataForStroke(pathList, strokeColor, opacity * strokeColor[3], [0, 0],
            lineWidth, filterType, this.currentFaceVector);
    }

    //////////////////// ImageData相关 /////////////////////////////

    createImageData(width, height) {
        if (arguments.length == 1) {
            let imgData = width;
            width = imgData.width;
            height = imgData.height;
        }
        let array = new Uint8ClampedArray(width * height * 4);
        let data = new ImageData(array, width, height);
        return data;
    }

    //******************** 扩展接口 *****************************//

    get filterType() {
        return this.currentContextState.filterType;
    }

    set filterType(filter) {
        this.currentContextState.filterType = filter;
    }

    static get Normal_Filter() {
        return ContextState.Normal_Filter;
    }

    static get GaussianBlur_Filter() {
        return ContextState.GaussianBlur_Filter;
    }

    static get Unsharpen_Filter() {
        return ContextState.Unsharpen_Filter;
    }

    static get Sharpness_Filter() {
        return ContextState.Sharpen_Filter;
    }

    static get Sharpen_Filter() {
        return ContextState.Sharpen_Filter;
    }

    static get EdgeDetect_Filter() {
        return ContextState.EdgeDetect_Filter;
    }

    static get SobelHorizontal_Filter() {
        return ContextState.SobelHorizontal_Filter;
    }

    static get SobelVertical_Filter() {
        return ContextState.SobelVertical_Filter;
    }

    static get PrevitHorizontal_Filter() {
        return ContextState.PrevitHorizontal_Filter;
    }

    static get PrevitVertical_Filter() {
        return ContextState.PrevitVertical_Filter;
    }

    static get BoxBlur_Filter() {
        return ContextState.BoxBlur_Filter;
    }

    static get TriangleBlur_Filter() {
        return ContextState.TriangleBlur_Filter;
    }

    static get Emboss_Filter() {
        return ContextState.Emboss_Filter;
    }

    applyCurrentTransform(point) {
        let m = this.currentContextState.transformMatrix;
        let temp = TEMP_VERTEX_COORD4DIM_ARRAY[0];
        temp[0] = point.x;
        temp[1] = point.y;
        temp[2] = point.z;
        temp[3] = 1;
        Mat4.multiplyWithVertex(m, temp, temp);
        return {x: temp[0], y: temp[1], z: temp[2]};
    }

    /**
     * 绘制一个定义好的graphics，但性能还不如直接画，慎用
     * @param graphics
     * @param x
     * @param y
     */
    drawGraphics(graphics, applyCurrentTransform) {
        if (this._tempGraphics != null) return;
        if (applyCurrentTransform == null) applyCurrentTransform = false;
        if (applyCurrentTransform)
            this.applyTransformForVDO(this.currentContextState.matrix, graphics.vdo, graphics.vdo);
        for (let i = 0; i < graphics.actionList.length; i++) {
            let action = graphics.actionList[i];
            let newAction = new RenderAction(action.type);
            newAction.textureIndex = action.textureIndex;
            newAction.renderPointNumber = action.renderPointNumber;
            newAction.opacityPointNumber = action.opacityPointNumber;
            this[_renderActionList].push(newAction);
        }
        let vdo = this.vdo;
        let offset = vdo.verticesData.currentIndex;
        vdo.verticesData.append(graphics.vdo.verticesData);
        vdo.fragmentData.append(graphics.vdo.fragmentData);
        let indexData = graphics.vdo.indexData;
        for (let i = 0; i < indexData.currentIndex; i++) {
            vdo.indexData.addIndex(indexData.getIndex(i) + offset);
        }
        offset = vdo.opacityVerticesData.currentIndex;
        vdo.opacityVerticesData.append(graphics.vdo.opacityVerticesData);
        vdo.opacityFragmentData.append(graphics.vdo.opacityFragmentData);
        let opIndexData = graphics.vdo.opacityIndexData;
        for (let i = 0; i < opIndexData.currentIndex; i++) {
            vdo.opacityIndexData.addIndex(opIndexData.getIndex(i) + offset);
        }
    }

    copyGraphicsVDO(graphics, out) {
        let vdo = graphics.vdo;
        if (out == null) {
            out = new VDO(vdo.verticesData.currentIndex, vdo.indexData.currentIndex, this._mixOpacity);
        }
        out.verticesData.copyFrom(vdo.verticesData);
        out.fragmentData.copyFrom(vdo.fragmentData);
        out.indexData.copyFrom(vdo.indexData);

        out.opacityVerticesData.copyFrom(vdo.opacityVerticesData);
        out.opacityFragmentData.copyFrom(vdo.opacityFragmentData);
        out.opacityIndexData.copyFrom(vdo.opacityIndexData);
        return out;
    }

    applyCurrentTransformForVDO(vdo, out) {
        this.applyTransformForVDO(this.currentContextState.matrix, vdo, out);
    }

    applyTransformForVDO(matrix, vdo, out) {
        if (out == null) out = vdo;
        Mat4.mat4ToMat3(matrix, TEMP_TRANFORM_MAT3);
        let _normalTransformMatrix = TEMP_TRANFORM_MAT3;
        //这里的数据需要从最开始记录的原始数据中进行计算：
        let verticesData = vdo.verticesData;
        let opacityVerticesData = vdo.opacityVerticesData;
        let targetVerticesData = out.verticesData;
        let targetOpaVerticesData = out.opacityVerticesData;
        let _tempVertices = TEMP_VERTEX_COORD4DIM_ARRAY[0];
        for (let i = 0; i < verticesData.currentIndex; i++) {
            _tempVertices[0] = verticesData.getVerticesPositionXData(i);
            _tempVertices[1] = verticesData.getVerticesPositionYData(i);
            _tempVertices[2] = verticesData.getVerticesPositionZData(i);
            Mat4.multiplyWithVertex(matrix, _tempVertices, _tempVertices);
            let x = _tempVertices[0];
            let y = _tempVertices[1];
            let z = _tempVertices[2];

            _tempVertices[0] = verticesData.getVerticesNormalXData(i);
            _tempVertices[1] = verticesData.getVerticesNormalYData(i);
            _tempVertices[2] = verticesData.getVerticesNormalZData(i);
            Mat3.multiplyWithVertex(_tempVertices, _normalTransformMatrix, _tempVertices);
            targetVerticesData.setVerticesData(x, y, z, _tempVertices[0], _tempVertices[1], _tempVertices[2], i);
        }
        for (let i = 0; i < opacityVerticesData.currentIndex; i++) {
            _tempVertices[0] = opacityVerticesData.getVerticesPositionXData(i);
            _tempVertices[1] = opacityVerticesData.getVerticesPositionYData(i);
            _tempVertices[2] = opacityVerticesData.getVerticesPositionZData(i);
            Mat4.multiplyWithVertex(matrix, _tempVertices, _tempVertices);
            let x = _tempVertices[0];
            let y = _tempVertices[1];
            let z = _tempVertices[2];

            _tempVertices[0] = opacityVerticesData.getVerticesNormalXData(i);
            _tempVertices[1] = opacityVerticesData.getVerticesNormalYData(i);
            _tempVertices[2] = opacityVerticesData.getVerticesNormalZData(i);
            Mat3.multiplyWithVertex(_tempVertices, _normalTransformMatrix, _tempVertices);
            targetOpaVerticesData.setVerticesData(x, y, z, _tempVertices[0], _tempVertices[1], _tempVertices[2], i);
        }
    }


    /**
     * 定义一个graphics
     * @param graphics
     * @param vertexNum
     */
    startGraphics(graphics, vertexNum) {
        if (this._tempGraphics != null) return;
        vertexNum = vertexNum || 4;
        this._tempPathArray = this[_pathList];
        this[_pathList] = [];
        this[_pathList].push(new Path3D());

        let state = new ContextState(new CanvasDrawingStylesWebgl2D());
        this[_stateStack].push(state);
        if (graphics != null) {
            graphics.vdo.init();
            graphics.actionList.length = 0;
        } else {
            graphics = {
                vdo: new VDO(vertexNum, vertexNum, this._mixOpacity),
                transformMatrixData: null,
                actionList: []
            };
        }
        this._tempVDO = this.vdo;
        this.vdo = graphics.vdo;

        this._tempGraphics = graphics;

        this._tempActionList = this[_renderActionList];
        this[_renderActionList] = graphics.actionList;
    }

    endGraphics() {
        this[_stateStack].pop();
        this[_pathList] = this._tempPathArray;
        this[_renderActionList] = this._tempActionList;
        this.vdo = this._tempVDO;

        this._tempPathArray = null;
        this._tempActionList = null;
        this._tempVDO = null;

        let tf = this._tempGraphics;
        this._tempGraphics = null;
        return tf;
    }

    loadBMFont(fntUrl, callbacks) {
        callbacks = callbacks || {};
        this.fontManager.loadBMFont(fntUrl, this.webglRender.textureManager, this.gl, callbacks);
    }

    turnOnLight() {
        this.webglRender.enableLight(true);
    }

    turnOffLight() {
        this.webglRender.enableLight(false);
    }

    setLightPosition(x, y, z) {
        this.webglRender.setLightPosition(x, y, z)
    }

    fillOrStroke(fillColor, strokeColor) {
        if (fillColor != undefined) {
            this.fillStyle = fillColor;
            this.fill();
        }
        if (strokeColor != undefined) {
            this.strokeStyle = strokeColor;
            this.stroke();
        }
    }

    fillStripe(points, stripeWidth, color, opacity, image, applyTransform) {
        if (applyTransform == undefined) applyTransform = true;
        if (applyTransform) {
            let tempPoints = [];
            for (let i = 0; i < points.length; i++) {
                let p = this.applyCurrentTransform(points[i]);
                tempPoints.push(p);
            }
            points = tempPoints;
        }
        let inputInterface = {
            getX: function (index) {
                return points[index].x;
            },
            getY: function (index) {
                return points[index].y;
            },
            getZ: function (index) {
                let z = points[index].z;
                if (z == undefined) return 0;
                return z;
            },
            getPointsNum: function () {
                return points.length;
            }
        };
        this._rawFillLine(inputInterface, stripeWidth, color, opacity, null, image);
    }

    _rawFillLine(inputInterface, lineWidth, color, opacity, filterType, image) {
        let pointsNum = inputInterface.getPointsNum();
        if (pointsNum < 2) return;
        if (opacity == null) opacity = 1;
        opacity = opacity * this.currentContextState.globalAlpha;
        let vod = this.vdo;
        vod.switch(opacity < 1);
        let faceDirection = this.currentFaceVector;
        filterType = filterType || this.currentContextState.filterType;
        color = color || this.currentContextState.fillStyle;
        let colorValue = Color.getInstance().convertStringToColor(color);
        let offset = vod.currentIndex;
        let texture = null;
        if (image) {
            texture = this.webglRender.textureManager.getTexture(image);
            vod.switch(opacity < 1 || texture.opacity);
        }
        let plusTextureWidth = 0;
        let plusTextureHeight = 0;
        if (texture != null) {
            plusTextureWidth = texture.width / (pointsNum - 1);
            plusTextureHeight = texture.height;
        }

        let outputInterface = {
            setPoint: function (p, index) {
                vod.currentVerticesData.setVerticesCoor(p.x, p.y, p.z, index + offset);
            },
            addPoint: function (p, lineIndex, pointIndexInTheLine) {
                if (vod.currentVerticesData != null) {
                    vod.currentVerticesData.addVerticesData(p.x, p.y, p.z, faceDirection[0], faceDirection[1], faceDirection[2]);
                }
                if (vod.fragmentData != null) {
                    let uv = [0, 0];
                    if (texture != null) {
                        if (lineIndex == 0) {
                            if (pointIndexInTheLine == 0) {
                                uv[0] = lineIndex * plusTextureWidth;
                                uv[1] = 0;
                            }
                            if (pointIndexInTheLine == 3) {
                                uv[0] = lineIndex * plusTextureWidth;
                                uv[1] = plusTextureHeight;
                            }
                        } else {
                            if (pointIndexInTheLine == 0) {
                                uv[0] = (lineIndex - 1) * plusTextureWidth + plusTextureWidth;
                                uv[1] = 0;
                            }
                            if (pointIndexInTheLine == 3) {
                                uv[0] = (lineIndex - 1) * plusTextureWidth + plusTextureWidth;
                                uv[1] = plusTextureHeight;
                            }
                        }
                        if (pointIndexInTheLine == 1) {
                            uv[0] = lineIndex * plusTextureWidth + plusTextureWidth;
                            uv[1] = 0;
                        }

                        if (pointIndexInTheLine == 2) {
                            uv[0] = lineIndex * plusTextureWidth + plusTextureWidth;
                            uv[1] = plusTextureHeight;
                        }
                    }
                    vod.currentFragmentData.addFragmentData(colorValue[0], colorValue[1], colorValue[2], opacity, uv[0], uv[1], -1, filterType);
                }
            }
        };

        let lineNum = LineToRectangle.generateRectanglesPoints(lineWidth, false, faceDirection, outputInterface, inputInterface);
        for (let k = 0; k < lineNum; k++) {
            let index = k * 4;
            vod.currentIndexData.addIndex(offset + index);
            vod.currentIndexData.addIndex(offset + index + 1);
            vod.currentIndexData.addIndex(offset + index + 2);

            vod.currentIndexData.addIndex(offset + index + 2);
            vod.currentIndexData.addIndex(offset + index + 3);
            vod.currentIndexData.addIndex(offset + index);
        }
        let action = new RenderAction(RenderAction.ACTION_FILL);
        action.textureIndex = -1;
        if (texture != null) action.textureIndex = texture.index;
        action.renderPointNumber = lineNum * 6;
        this[_renderActionList].push(action);

        vod.switch(false);
    }

    drawRectangle(x, y, w, h, fillColor, strokeColor) {
        this.save();
        this.beginPath();
        this.rect(x, y, w, h);
        this.currentPath.subPathArray[this.currentPath.subPathNumber - 2].isRegularRect = true;
        this.fillOrStroke(fillColor, strokeColor);
        this.restore();
    }

    drawEllipse(x, y, r1, r2, fillColor, strokeColor, rotation) {
        rotation = rotation || 0;
        this.save();
        this.beginPath();
        this.ellipse(x, y, r1, r2, rotation, 0, Tools.PI2, false);
        this.closePath();
        this.fillOrStroke(fillColor, strokeColor);
        this.restore();
    }

    drawCircle(x, y, r, fillColor, strokeColor) {
        this.drawEllipse(x, y, r, r, fillColor, strokeColor, 0);
    }

    update() {
        this.draw();
    }

    draw() {
        if (this._tempGraphics != null) return;
        this.webglRender.initRending();
        this.webglRender.executeRenderAction(this[_renderActionList]);
        this[_renderActionList] = [];
        this.vdo.init();
        this.webglRender.textureManager.clean();
        this._painedGraphicsMap = {};
        // debug:
        // console.log("绘制调用次数：", this.webglRender.DEBUG_DRAW_COUNT);
    }

    loadImage(src, callbacks, split, id) {
        throw new Error('this methods was not implemented');
        // this.webglRender.textureManager.registerTexture(id, this.gl, null, src, callbacks, split);
    }

    getTexture(id, index) {
        return this.webglRender.textureManager.getTextureById(id, index);
    }


    /**********************************************3d部分绘制*****************************************/

    drawCube(x, y, z, width, height, depth, properties) {

        let defaultColor = this.fillStyle;
        let frontColor = defaultColor;
        let backColor = defaultColor;
        let rightColor = defaultColor;
        let leftColor = defaultColor;
        let bottomColor = defaultColor;
        let topColor = defaultColor;
        let defaultOpacity = this.globalAlpha;
        let topOpa = defaultOpacity;
        let bottomOpa = defaultOpacity;
        let leftOpa = defaultOpacity;
        let rightOpa = defaultOpacity;
        let frontOpa = defaultOpacity;
        let backOpa = defaultOpacity;
        if (properties !== undefined) {
            frontColor = properties.frontColor || defaultColor;
            backColor = properties.backColor || defaultColor;
            rightColor = properties.rightColor || defaultColor;
            leftColor = properties.leftColor || defaultColor;
            bottomColor = properties.bottomColor || defaultColor;
            topColor = properties.topColor || defaultColor;
            if (properties.topOpacity != null)
                topOpa *= properties.topOpacity;
            if (properties.bottomOpacity != null)
                bottomOpa *= properties.bottomOpacity;
            if (properties.rightOpacity != null)
                rightOpa *= properties.rightOpacity;
            if (properties.leftOpacity != null)
                leftOpa *= properties.leftOpacity;
            if (properties.frontOpacity != null)
                frontOpa *= properties.frontOpacity;
            if (properties.backOpacity != null)
                backOpa *= properties.backOpacity;
        }
        //正面：
        this.save();
        this.globalAlpha = frontOpa;
        this.fillStyle = frontColor;
        this.translate(x, y, z);
        this.fillRect(-width / 2, -height / 2, width, height, depth / 2);
        this.restore();

        //背面
        this.save();
        this.fillStyle = backColor;
        this.globalAlpha = backOpa;
        this.translate(x, y, z);
        //这里是为了面的朝向发生改变，其实不考虑法向量的话直接画都行
        this.rotateY(Math.PI);
        this.fillRect(-width / 2, -height / 2, width, height, depth / 2);
        this.restore();

        //左侧：
        this.save();
        this.fillStyle = leftColor;
        this.globalAlpha = leftOpa;
        this.translate(x, y, z);
        this.rotateY(-Math.PI / 2);
        this.fillRect(-depth / 2, -height / 2, depth, height, width / 2);
        this.restore();

        //右侧：
        this.save();
        this.fillStyle = rightColor;
        this.globalAlpha = rightOpa;
        this.translate(x, y, z);
        this.rotateY(Math.PI / 2);
        this.fillRect(-depth / 2, -height / 2, depth, height, width / 2);
        this.restore();

        //底部：
        this.save();
        this.fillStyle = bottomColor;
        this.globalAlpha = bottomOpa;
        this.translate(x, y, z);
        this.rotateX(-Math.PI / 2);
        this.fillRect(-width / 2, -depth / 2, width, depth, height / 2);
        this.restore();

        //顶部：
        this.save();
        this.fillStyle = topColor;
        this.globalAlpha = topOpa;
        this.translate(x, y, z);
        this.rotateX(Math.PI / 2);
        this.fillRect(-width / 2, -depth / 2, width, depth, height / 2);
        this.restore();
    }

    drawCylinder(x, y, z, height, radiusX, radiusY, startAngle, endAngle, properties) {
        if (startAngle === endAngle) return;
        if (radiusX < 0 || radiusY < 0) throw new Error('IndexError.半径必须不小于0. Radius should not be smaller than zero. BanJing BiXu BuXiaoYu Ling');
        let anticlockwise = false;
        if (radiusX == 0 || radiusY == 0) return;
        let bottomColor = Color.getInstance().convertStringToColor(this.currentContextState.fillStyle);
        let topColor = Color.getInstance().convertStringToColor(this.currentContextState.fillStyle);
        let surfaceColor = Color.getInstance().convertStringToColor(this.currentContextState.fillStyle);

        let opacity = this.globalAlpha;
        let topOpa = opacity;
        let bottomOpa = opacity;
        let surfaceOpa = opacity;
        if (properties !== undefined) {
            if (properties.bottomColor !== undefined) {
                bottomColor = Color.getInstance().convertStringToColor(properties.bottomColor);
            }
            if (properties.topColor !== undefined) {
                topColor = Color.getInstance().convertStringToColor(properties.topColor);
            }
            if (properties.surfaceColor !== undefined) {
                surfaceColor = Color.getInstance().convertStringToColor(properties.surfaceColor);
            }

            if (properties.topOpacity != undefined)
                topOpa *= properties.topOpacity;
            if (properties.bottomOpacity != undefined)
                bottomOpa *= properties.bottomOpacity;
            if (properties.surfaceOpacity != undefined)
                surfaceOpa *= properties.surfaceOpacity;
        }

        let UV = [0, 0];
        let action = new RenderAction(RenderAction.ACTION_FILL);
        this.renderActionList.push(action);
        //清空当前的路径坐标
        this.beginPath();

        // let vd = this.getVDOArrays().verticesData;
        // let fd = this.getVDOArrays().fragmentData;
        // let id = this.getVDOArrays().indexData;
        let vdo = this.vdo;

        let tempMat = Mat4.identity();
        let tempMat1 = Mat4.TEMP_MAT4[0];
        let currentMatrix = this.currentContextState.transformMatrix;

        // 面朝下:
        Mat4.translationMatrix(tempMat1, x, y + height / 2, z);
        Mat4.multiply(tempMat, currentMatrix, tempMat1);
        Mat4.rotationXMatrix(tempMat1, -Math.PI / 2);
        Mat4.multiply(tempMat, tempMat, tempMat1);
        let bottomEllipseMat = this.getEllipseCalculateTempMatrix(0, 0, 0, radiusX, radiusY, 0, tempMat);

        //计算法向量：
        let tempPoint = {x: 0, y: 0, z: 0};
        let tempPoint2 = {x: 0, y: 0, z: 1};
        Mat4.multiplyWithVet3(tempMat, tempPoint, tempPoint);
        Mat4.multiplyWithVet3(tempMat, tempPoint2, tempPoint2);

        let bottomNormal = {x: 0, y: 0, z: 0};
        Vector3.sub(bottomNormal, tempPoint2, tempPoint);
        Vector3.normalize(bottomNormal, bottomNormal);
        let topNormal = {x: -bottomNormal.x, y: -bottomNormal.y, z: -bottomNormal.z};


        //添加圆心坐标点
        let center1 = {x: 0, y: 0, z: 0};
        Vector3.copy(tempPoint, center1);
        let center2 = {x: 0, y: 0, z: 0};
        vdo.switch(bottomOpa < 1);
        let bottomCenterIndex = vdo.currentIndex;
        vdo.addVerticesData2(center1, bottomNormal, bottomColor, bottomOpa, UV, -1, 0);
        vdo.switch(false);

        let scaleVet = {x: 0, y: 0, z: 0};
        Vector3.multiplyValue(scaleVet, topNormal, height);

        Vector3.plus(center2, center1, scaleVet);
        vdo.switch(topOpa < 1);
        let topCenterIndex = vdo.currentIndex;
        vdo.addVerticesData2(center2, topNormal, topColor, topOpa, UV, -1, 0);
        vdo.switch(false);

        let realRadius1 = Math.max(radiusX * this.currentContextState.scaleValue.x,
            radiusY * this.currentContextState.scaleValue.y); // 这个值要根据当前缩放算一下
        let deltaTheta = (Math.asin(1 / realRadius1) * 2);
        // deltaTheta = Math.PI/2;

        startAngle = this.adjustEllipseAngle(startAngle, anticlockwise);
        endAngle = this.adjustEllipseAngle(endAngle, anticlockwise);

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
        let tempVet = {x: 0, y: 0, z: 0};
        let tempVet2 = {x: 0, y: 0, z: 0};
        let preBottomPoint = undefined;
        let preTopPoint = undefined;

        let currentBottomIndex = vdo.originalCurrentIndex;
        if (bottomOpa < 1) currentBottomIndex = vdo.opacityCurrentIndex;
        let currentTopIndex = vdo.originalCurrentIndex;
        if (topOpa < 1) currentTopIndex = vdo.opacityCurrentIndex;
        let preBottomIndex = -1;
        let preTopIndex = -1;

        let firstBottomIndex = -1;
        let firstTopIndex = -1;
        let tempNormal = {x: 0, y: 0, z: 0};
        let currentSurfaceIndex = -1;
        let firstSurfacePoint1;
        let firstSurfacePoint2;
        let lastSurfacePoint1 = {x: 0, y: 0, z: 0};
        let lastSurfacePoint2 = {x: 0, y: 0, z: 0};
        let tempSurfaceNormal = {x: 0, y: 0, z: 0};
        let isFullEllipse = Math.abs(endAngle - startAngle) >= Tools.PI2;
        let theta = 0;
        let bottomCirclePoints = [];
        let topCirclePoints = [];
        for (theta = startAngle; theta < endAngle; theta += deltaTheta) {
            if (Math.abs(theta - startAngle) >= Tools.PI2) {
                return;
            }

            let s = Math.sin(theta);
            let c = Math.cos(theta);
            tempVet.x = c;
            tempVet.y = s;
            tempVet.z = 0;
            Mat4.multiplyWithVet3(bottomEllipseMat, tempVet, tempVet);

            bottomCirclePoints.push({x: tempVet.x, y: tempVet.y, z: tempVet.z});
            Vector3.plus(tempVet2, tempVet, scaleVet);
            topCirclePoints.push({x: tempVet2.x, y: tempVet2.y, z: tempVet2.z});
        }

        //组织bottom面：
        vdo.switch(bottomOpa < 1);
        let bottomStartIndex = vdo.currentIndex;
        for (let i = 0; i < bottomCirclePoints.length; i++) {
            let p = bottomCirclePoints[i];
            vdo.addVerticesData2(p, bottomNormal, bottomColor, bottomOpa, UV, -1, 0);
            vdo.addIndex(bottomCenterIndex);
            vdo.addIndex(bottomStartIndex + i);
            let nextIndex = i + 1;
            if (nextIndex >= bottomCirclePoints.length) nextIndex = 0;
            vdo.addIndex(bottomStartIndex + nextIndex);
        }
        if (vdo.useOpacityBuffer) {
            action.opacityPointNumber += bottomCirclePoints.length * 3;
        } else {
            action.renderPointNumber += bottomCirclePoints.length * 3;
        }
        vdo.switch(false);


        //组织top面：
        vdo.switch(topOpa < 1);
        let topStartIndex = vdo.currentIndex;
        for (let i = 0; i < topCirclePoints.length; i++) {
            let p = topCirclePoints[i];
            vdo.addVerticesData2(p, topNormal, topColor, topOpa, UV, -1, 0);
            vdo.addIndex(topCenterIndex);
            vdo.addIndex(topStartIndex + i);
            let nextIndex = i + 1;
            if (nextIndex >= bottomCirclePoints.length) nextIndex = 0;
            vdo.addIndex(topStartIndex + nextIndex);
        }
        if (vdo.useOpacityBuffer) {
            action.opacityPointNumber += bottomCirclePoints.length * 3;
        } else {
            action.renderPointNumber += bottomCirclePoints.length * 3;
        }
        vdo.switch(false);

        //组织侧面：
        vdo.switch(surfaceOpa < 1);
        for (let i = 0; i < topCirclePoints.length; i++) {

            let nextIndex = i + 1;
            if (nextIndex >= bottomCirclePoints.length) {
                nextIndex = 0;
            }

            let p1 = bottomCirclePoints[i];
            let p2 = topCirclePoints[i];
            let p3 = topCirclePoints[nextIndex];
            let p4 = bottomCirclePoints[nextIndex];

            Vector3.sub(tempSurfaceNormal, p4, p1);
            Vector3.normalize(tempSurfaceNormal, tempSurfaceNormal);
            Vector3.cross(tempNormal, tempSurfaceNormal, bottomNormal);
            let surfaceStartIndex = vdo.addVerticesData2(p1, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
            vdo.addVerticesData2(p2, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
            vdo.addVerticesData2(p3, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
            vdo.addVerticesData2(p4, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);

            vdo.addIndex(surfaceStartIndex);
            vdo.addIndex(surfaceStartIndex + 1);
            vdo.addIndex(surfaceStartIndex + 2);

            vdo.addIndex(surfaceStartIndex + 2);
            vdo.addIndex(surfaceStartIndex + 3);
            vdo.addIndex(surfaceStartIndex);
        }
        if (vdo.useOpacityBuffer) {
            action.opacityPointNumber += bottomCirclePoints.length * 6;
        } else {
            action.renderPointNumber += bottomCirclePoints.length * 6;
        }
        vdo.switch(false);


        /****下面的方法快，而且少耗内存，但是由于没有不透明的深度排序，会出问题，目前采用上面那种分别绘制底面、顶面和侧面****/
        // for (theta = startAngle; theta < endAngle; theta += deltaTheta) {
        //  if (Math.abs(theta - startAngle) >= Tools.PI2) {
        //         return;
        //     }
        //
        //  // 底面圆坐标计算：
        //  let s = Math.sin(theta);
        //  let c = Math.cos(theta);
        //  tempVet.x = c;
        //  tempVet.y = s;
        //  tempVet.z = 0;
        //  Mat4.multiplyWithVet3(bottomEllipseMat, tempVet, tempVet);
        //  vdo.switch(bottomOpa < 1);
        //  currentBottomIndex = vdo.currentIndex;
        //  vdo.addVerticesData2(tempVet, bottomNormal, bottomColor, bottomOpa, UV, -1, 0);
        //  vdo.switch(false);
        //
        //  //顶层圆坐标计算：
        //  Vector3.plus(tempVet2, tempVet, scaleVet);
        //  vdo.switch(topOpa < 1);
        //  currentTopIndex = vdo.currentIndex;
        //  vdo.addVerticesData2(tempVet2, topNormal, topColor, topOpa, UV, -1, 0);
        //  vdo.switch(false);
        //
        //  if (preBottomPoint === undefined && preTopPoint === undefined) {
        //         // 无法形成面,记录
        //         firstBottomIndex = currentBottomIndex;
        //         firstTopIndex = currentTopIndex;
        //         preBottomIndex = currentBottomIndex;
        //         preTopIndex = currentTopIndex;
        //
        //         preBottomPoint = {x: 0, y: 0, z: 0};
        //         preTopPoint = {x: 0, y: 0, z: 0};
        //         Vector3.copy(tempVet, preBottomPoint);
        //         Vector3.copy(tempVet2, preTopPoint);
        //         firstSurfacePoint1 = {x: 0, y: 0, z: 0};
        //         firstSurfacePoint2 = {x: 0, y: 0, z: 0};
        //         Vector3.copy(tempVet, firstSurfacePoint1);
        //         Vector3.copy(tempVet2, firstSurfacePoint2);
        //
        //     } else {
        //         //由于圆柱侧面的法线不同，需要重新添加坐标：
        //
        //         //计算面的法线：
        //         Vector3.sub(tempSurfaceNormal, tempVet, preBottomPoint);
        //         Vector3.normalize(tempSurfaceNormal, tempSurfaceNormal);
        //         Vector3.cross(tempNormal, tempSurfaceNormal, bottomNormal);
        //         currentSurfaceIndex = vdo.originalCurrentIndex;
        //         vdo.switch(surfaceOpa < 1);
        //         currentSurfaceIndex = vdo.currentIndex;
        //         Vector3.copy(tempVet, lastSurfacePoint1);
        //         Vector3.copy(tempVet2, lastSurfacePoint2);
        //         vdo.addVerticesData2(preBottomPoint, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //         vdo.addVerticesData2(tempVet, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //         vdo.addVerticesData2(tempVet2, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //         vdo.addVerticesData2(preTopPoint, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //
        //
        //         //建立侧面：
        //         vdo.addIndex(currentSurfaceIndex);
        //         vdo.addIndex(currentSurfaceIndex + 1);
        //         vdo.addIndex(currentSurfaceIndex + 2);
        //
        //         vdo.addIndex(currentSurfaceIndex + 2);
        //         vdo.addIndex(currentSurfaceIndex + 3);
        //         vdo.addIndex(currentSurfaceIndex);
        //         if (vdo.useOpacityBuffer) {
        //             action.opacityPointNumber += 6;
        //         } else {
        //             action.renderPointNumber += 6;
        //         }
        //         vdo.switch(false);
        //
        //         vdo.switch(bottomOpa < 1);
        //         //建立底层圆索引：
        //         vdo.addIndex(bottomCenterIndex);
        //         vdo.addIndex(preBottomIndex);
        //         vdo.addIndex(currentBottomIndex);
        //         if (vdo.useOpacityBuffer) {
        //             action.opacityPointNumber += 3;
        //         } else {
        //             action.renderPointNumber += 3;
        //         }
        //         vdo.switch(false);
        //
        //         vdo.switch(topOpa < 1);
        //         //建立顶层圆索引：
        //         vdo.addIndex(topCenterIndex);
        //         vdo.addIndex(preTopIndex);
        //         vdo.addIndex(currentTopIndex);
        //         if (vdo.useOpacityBuffer) {
        //             action.opacityPointNumber += 3;
        //         } else {
        //             action.renderPointNumber += 3;
        //         }
        //         vdo.switch(false);
        //
        //         Vector3.copy(tempVet, preBottomPoint);
        //         Vector3.copy(tempVet2, preTopPoint);
        //         preBottomIndex = currentBottomIndex;
        //         preTopIndex = currentTopIndex;
        //     }
        //  }
        //  //封边：
        //  if (isFullEllipse) {
        //
        //     // 完成圆形第一个点的底面/顶面
        //     vdo.switch(bottomOpa < 1);
        //     vdo.addIndex(bottomCenterIndex);
        //     vdo.addIndex(currentBottomIndex);
        //     vdo.addIndex(firstBottomIndex);
        //     if (vdo.useOpacityBuffer) {
        //         action.opacityPointNumber += 3;
        //     } else {
        //         action.renderPointNumber += 3;
        //     }
        //     vdo.switch(false);
        //
        //     vdo.switch(topOpa < 1);
        //     vdo.addIndex(topCenterIndex);
        //     vdo.addIndex(currentTopIndex);
        //     vdo.addIndex(firstTopIndex);
        //     if (vdo.useOpacityBuffer) {
        //         action.opacityPointNumber += 3;
        //     } else {
        //         action.renderPointNumber += 3;
        //     }
        //     vdo.switch(false);
        //
        //     //首尾相连：
        //     Vector3.sub(tempSurfaceNormal, lastSurfacePoint1, firstSurfacePoint1);
        //     Vector3.normalize(tempSurfaceNormal, tempSurfaceNormal);
        //     Vector3.cross(tempNormal, tempSurfaceNormal, bottomNormal);
        //
        //     vdo.switch(surfaceOpa < 1);
        //     let index = vdo.currentIndex;
        //     vdo.addVerticesData2(lastSurfacePoint1, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //     vdo.addVerticesData2(firstSurfacePoint1, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //     vdo.addVerticesData2(firstSurfacePoint2, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //     vdo.addVerticesData2(lastSurfacePoint2, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //     //建立侧面：
        //     vdo.indexData.addIndex(index);
        //     vdo.indexData.addIndex(index + 1);
        //     vdo.indexData.addIndex(index + 2);
        //
        //     vdo.indexData.addIndex(index + 2);
        //     vdo.indexData.addIndex(index + 3);
        //     vdo.indexData.addIndex(index);
        //     if (vdo.useOpacityBuffer) {
        //         action.opacityPointNumber += 6;
        //     } else {
        //         action.renderPointNumber += 6;
        //     }
        //     vdo.switch(false);
        // } else {
        //     //侧面各自和中心完成封边：
        //     Vector3.sub(tempSurfaceNormal, firstSurfacePoint1, center1);
        //     Vector3.cross(tempNormal, bottomNormal, tempSurfaceNormal);
        //     Vector3.normalize(tempNormal, tempNormal);
        //     vdo.switch(surfaceOpa < 1);
        //     let index = vdo.currentIndex;
        //     vdo.addVerticesData2(center1, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //     vdo.addVerticesData2(center2, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //     vdo.addVerticesData2(firstSurfacePoint2, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //     vdo.addVerticesData2(firstSurfacePoint1, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //     //建立侧面：
        //     vdo.addIndex(index);
        //     vdo.addIndex(index + 1);
        //     vdo.addIndex(index + 2);
        //
        //     vdo.addIndex(index + 2);
        //     vdo.addIndex(index + 3);
        //     vdo.addIndex(index);
        //     let temp = {x: 0, y: 0, z: 0};
        //     Vector3.sub(temp, lastSurfacePoint1, center1);
        //     Vector3.cross(tempNormal, bottomNormal, temp);
        //     Vector3.normalize(tempNormal, tempNormal);
        //     index = vdo.currentIndex;
        //     vdo.addVerticesData2(center1, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //     vdo.addVerticesData2(center2, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //     vdo.addVerticesData2(lastSurfacePoint2, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //     vdo.addVerticesData2(lastSurfacePoint1, tempNormal, surfaceColor, surfaceOpa, UV, -1, 0);
        //     //建立侧面：
        //     vdo.addIndex(index);
        //     vdo.addIndex(index + 1);
        //     vdo.addIndex(index + 2);
        //
        //     vdo.addIndex(index + 2);
        //     vdo.addIndex(index + 3);
        //     vdo.addIndex(index);
        //
        //     if (vdo.useOpacityBuffer) {
        //         action.opacityPointNumber += 12;
        //     } else {
        //         action.renderPointNumber += 12;
        //     }
        //     vdo.switch(false);
        // }
    }
}