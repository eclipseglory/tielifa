import ContextState from "./ContextState.js";
import CanvasDrawingStylesWebgl2D from "./CanvasDrawingStylesWebgl2D.js";
import Path3D from "./Path3D.js";
import SubPath3D from "./SubPath3D.js";
import Color from "../utils/Color.js";
import RenderAction from "./RenderAction.js";
import WebGLRender from "./WebGLRender.js";
import Tools from "../utils/Tools.js";
import Mat4 from "../math/Mat4.js";
import VerticesData from "./VerticesData.js";
import FragmentData from "./FragmentData.js";
import TransformMatrixData from "./TransformMatrixData.js";
import Vector3 from "../math/Vector3.js";
import GeometryTools from "../geometry/GeometryTools.js";
import Vector2 from "../math/Vector2.js";
import BMFontManager from "../font/BMFontManager.js";
import IndexData from "./IndexData.js";
import LineToRectangle from "../geometry/LineToRectangle.js";
import Texture from "./Texture.js";

let _canvas = Symbol('对应的Canvas');
let _stateStack = Symbol('状态栈');
let _pathList = Symbol('路径列表');
let _renderActionList = Symbol('绘制动作List');
let _subpathCatch = Symbol('子Path缓存');

const SPACE_CHAR_ID = " ".charCodeAt(0);
const FACE_NORMAL4 = new Float32Array(4);
const ORI_NORMAL4 = new Float32Array(4);
const WHITE_COLOR = [255, 255, 255];
// let TEMP_VERTEX_COORD4DIM_ARRAY = [[0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1]];
let TEMP_VERTEX_COORD4DIM_ARRAY = [new Float32Array(4), new Float32Array(4), new Float32Array(4), new Float32Array(4)];
export default class CanvasRenderingContextWebgl2D {
    constructor(canvas, properties) {
        if (properties == null || properties == undefined) properties = [];
        for (let i = 0; i < TEMP_VERTEX_COORD4DIM_ARRAY.length; i++) {
            // w要设为1
            TEMP_VERTEX_COORD4DIM_ARRAY[i][3] = 1;
        }
        FACE_NORMAL4[2] = 1;
        FACE_NORMAL4[3] = 1;
        ORI_NORMAL4[3] = 1;
        this[_canvas] = canvas;
        if (canvas == null || canvas == undefined) throw new Error('canvas can not be undefined or null');
        this.gl = canvas.getContext('webgl');
        if (this.gl == undefined) throw new Error('Current canvas doesnt support WebGL');
        // this.defaultDepth = -canvas.height * 2;
        let FOV = properties['FOV'] || 20;
        let t = Math.tan(FOV * Math.PI / 180);
        this.defaultDepth = -canvas.height / (2 * t);
        this.maxBufferByteLength = properties['maxMemorySize'] || 1024 * 1024;
        this[_stateStack] = [];
        this[_pathList] = [];
        this[_renderActionList] = [];
        this[_subpathCatch] = [];
        this.webglRender = new WebGLRender(this.gl,
            properties['maxTransformNum'],
            properties['maxTextureSize'],
            properties['projectionType'],
            FOV,
            properties['enableLight'],
            properties['enableDepthTest']
        );
        let maxVertexNumber = this.maxBufferByteLength / 32;
        this.verticesData = new VerticesData(maxVertexNumber);
        // DEBUG :
        // console.log(maxVertexNumber,this.verticesData.totalByteLength);
        // this.verticesDataSet = new VerticesDataSet(maxVertexNumber);
        this.indexData = new IndexData(maxVertexNumber);
        this.fragmentData = new FragmentData(maxVertexNumber);
        this.transformMatrixData = new TransformMatrixData(maxVertexNumber);
        this.webglRender.verticesData = this.verticesData;
        this.webglRender.fragmentData = this.fragmentData;
        this.webglRender.transformMatrixData = this.transformMatrixData;
        this.webglRender.indexData = this.indexData;
        this.currentFaceNormal = new Float32Array(4);
        this.currentFaceNormal[2] = 1;
        this._tempPathArray = null;
        this._tempActionList = null;
        this._tempGraphics = null;
        this._painedGraphicsMap = {};
        this.fontManager = new BMFontManager();

        this.tempVDOArrays = {
            verticesData: null,
            fragmentData: null,
            indexData: null,
            transformMatrixData: null
        };

        this.currentVDOArrays = {
            verticesData: this.verticesData,
            fragmentData: this.fragmentData,
            indexData: this.indexData,
            transformMatrixData: this.transformMatrixData
        };
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

    get currentFaceVector() {
        let m = this.currentContextState.transformMatrix;
        let temp1 = Vector3.TEMP_VECTORS[0];
        let temp2 = Vector3.TEMP_VECTORS[1];
        temp1.x = FACE_NORMAL4[0];
        temp1.y = FACE_NORMAL4[1];
        temp1.z = FACE_NORMAL4[2];
        temp1.value[3] = 1;
        temp2.x = ORI_NORMAL4[0];
        temp2.y = ORI_NORMAL4[1];
        temp2.z = ORI_NORMAL4[2];
        temp2.value[3] = 1;
        if (!Mat4.isIdentity(m)) {
            Mat4.multiplyWithVertex(m, FACE_NORMAL4, temp1.value);
            Mat4.multiplyWithVertex(m, ORI_NORMAL4, temp2.value);
        }
        this.currentFaceNormal[0] = temp1.x - temp2.x;
        this.currentFaceNormal[1] = temp1.y - temp2.y;
        this.currentFaceNormal[2] = temp1.z - temp2.z;
        return this.currentFaceNormal;
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
    clean() {
        this[_pathList].length = 0;
        this.webglRender.clean();
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
        // 计算出三姐导数：6(p3 - 3p2 + 3p1-p0) 不知道算没算错 ：）
        // TODO 这种算法是错误的
        let sx = 6 * (x - 3 * cp2x + 3 * cp1x - cp0x);
        let sy = 6 * (y - 3 * cp2y + 3 * cp1y - cp0y);
        let r = 1 / (sx * sx + sy * sy);
        let delta = Math.pow(r, 1 / 6);
        // 上述算法是错误的
        delta = 0.01;
        let temp = TEMP_VERTEX_COORD4DIM_ARRAY[0];
        let segment = delta;
        for (; segment <= 1; segment += delta) {
            GeometryTools.cubicBezier(segment, cp0x, cp0y, cp1x, cp1y, cp2x, cp2y, x, y, temp);
            this.addPointInLastSubPath(temp[0], temp[1], defaultZ, false);
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
        // 用泰勒展开计算近似
        // B(t) = P0 + 2(P1 - P0)t + (P2-2P1+P0)t^2
        let bx0 = cp0x, bx1 = 2 * (cpx - cp0x), bx3 = x - 2 * cpx + cp0x;
        let by0 = cp0y, by1 = 2 * (cpx - cp0y), by3 = y - 2 * cpy + cp0y;
        // 这里要是能让delta x平方加上delta y平方等于1，可以求出这个delta t的近似值
        // 下面这个算法是错误的
        let sx = 2 * (x - 2 * cpx + cp0x);
        let sy = 2 * (y - 2 * cpy + cp0y);
        let r = 1 / (sx * sx + sy * sy);
        let delta = Math.pow(r, 0.25);
        // 上面算法错误的
        // delta = 0.01;
        let temp = TEMP_VERTEX_COORD4DIM_ARRAY[0];
        let segment = delta;
        for (; segment <= 1; segment += delta) {
            GeometryTools.quadraticBezier(segment, cp0x, cp0y, cpx, cpy, x, y, temp);
            this.addPointInLastSubPath(temp[0], temp[1], cpz, false);
        }
        this.addPointInLastSubPath(x, y, z, false);
        // currentState.fireDirty();
    }

    // 没有实现这个椭圆的：arcTo(x1: number, y1: number, x2: number, y2: number, radiusX: number, radiusY: number, rotation: number): void;
    /**
     * TODO 这个方法有个bug，path中的最后一个点所应用的转换矩阵不一定就是当前矩阵
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

    ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
        if (radiusX < 0 || radiusY < 0) throw new Error('IndexError.半径必须不小于0. Radius should not be smaller than zero. BanJing BiXu BuXiaoYu Ling');
        if (radiusX == 0 || radiusY == 0) return;
        if (anticlockwise == undefined) anticlockwise = false;

        let subpath = this.currentPath.lastSubPath;
        if (subpath == undefined) {
            subpath = new SubPath3D();
            this.currentPath.addSubPath(subpath);
        }

        let currentMatrix = Mat4.TEMP_MAT4[0];
        Mat4.translationMatrix(currentMatrix, x, y, 0);
        let tm = this.currentContextState.transformMatrix;
        Mat4.multiply(currentMatrix, tm, currentMatrix);
        let transformMatrix = Mat4.TEMP_MAT4[1];
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

        /*
          这是一个笨方法(stupid method)，用一个长度为1的线，对它进行变换，然后计算线程长度的缩放情况来确定当前的缩放倍数
         */
        let testPoint1 = TEMP_VERTEX_COORD4DIM_ARRAY[0];
        testPoint1[0] = 0;
        testPoint1[1] = 0;
        testPoint1[2] = 0;
        testPoint1[3] = 1;
        Mat4.multiplyWithVertex(tm, testPoint1, testPoint1);
        let testX0 = testPoint1[0];
        let testY0 = testPoint1[1];

        testPoint1[0] = 1;
        testPoint1[1] = 0;
        testPoint1[2] = 0;
        testPoint1[3] = 1;
        Mat4.multiplyWithVertex(tm, testPoint1, testPoint1);
        let testX1 = testPoint1[0];
        let testY1 = testPoint1[1];
        let scale = (testX1 - testX0) * (testX1 - testX0) + (testY1 - testY0) * (testY1 - testY0);
        scale = Math.sqrt(scale);

        let realRadius1 = Math.max(radiusX * scale, radiusY * scale); // 这个值要根据当前缩放算一下
        let deltaTheta = (Math.asin(1 / realRadius1) * 2);

        let thetaVector = new Vector3();

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
        // let nextPoint = TEMP_VERTEX_COORD4DIM_ARRAY[0];
        // GeometryTools.getEllipsePointWithRadian(x, y, radiusX, radiusY, endAngle, rotation, nextPoint);
        // this.lineTo(nextPoint[0], nextPoint[1]);

        function adjustAngle(angle) {
            let PI2 = 2 * Math.PI;
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

    drawImage(image, srcX, srcY, srcWidth, srcHeight,
              dstX, dstY, dstWidth, dstHeight, depth, color) {
        depth = depth || 0;
        let texture;
        if (image instanceof Texture) {
            texture = image;
        } else {
            texture = this.webglRender.textureManager.getTexture(image, this.gl, true);
        }
        // let texture = this.webglRender.textureManager.getTexture(image, this.gl, true);
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
        if (arguments.length == 4) {
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
        if (arguments.length == 6) {
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
        if (arguments.length == 9 || arguments.length == 10 || arguments.length == 11) {
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
        let vdo = this.getVDOArrays();
        action.verticesData = vdo.verticesData;
        action.fragmentData = vdo.fragmentData;
        action.indexData = vdo.indexData;
        action.collectVertexDataForFill(pathList, color, opacity, texCoordArray, this.currentContextState.filterType
            , this.currentFaceVector);
    }


    fill() {
        let fillColor = Color.getInstance().convertStringToColor(this.currentContextState.fillStyle);
        let opacity = this.currentContextState.globalAlpha;
        let pathList = this[_pathList];
        let action = new RenderAction(RenderAction.ACTION_FILL);
        let vdo = this.getVDOArrays();
        action.verticesData = vdo.verticesData;
        action.fragmentData = vdo.fragmentData;
        action.indexData = vdo.indexData;
        this[_renderActionList].push(action);
        action.collectVertexDataForFill(pathList, fillColor, opacity * fillColor[3], [0, 0],
            this.currentContextState.filterType, this.currentFaceVector);
    }

    measureText(text, bmfont) {
        if (bmfont == undefined) {
            let font = this.fontFamily;
            font = font.trim().toLocaleLowerCase();
            bmfont = this.fontManager.getBMFont(font);
            if (bmfont == undefined) {
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

    fillText(text, x, y, maxWidth) {
        let font = this.fontFamily;
        font = font.trim().toLocaleLowerCase();
        let bmfont = this.fontManager.getBMFont(font);
        if (bmfont == undefined) {
            throw new Error('TieLiFa can not find the font:' + font + ',you can register the BM Font with API');
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
        let totalWidth = this.measureText(text, bmfont);
        let sw = 1;
        let realWidth = totalWidth.width;
        if ((maxWidth != undefined) && (maxWidth < totalWidth.width)) {
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
                this.drawImage(img, c.x, c.y, c.width, c.height, x + c.xoffset * sw, y + c.yoffset, w, h, 0, fillColor);
            }
            x += c.xadvance * sw;
        }
        this.restore();
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
        let vdo = this.getVDOArrays();
        action.verticesData = vdo.verticesData;
        action.fragmentData = vdo.fragmentData;
        action.indexData = vdo.indexData;
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
    drawGraphics(graphics, x, y) {
        if (this._tempGraphics != null) return;
        for (let i = 0; i < graphics.actionList.length; i++) {
            let action = graphics.actionList[i];
            let newAction = new RenderAction(action.type);
            newAction.textureIndex = action.textureIndex;
            newAction.renderPointNumber = action.renderPointNumber;
            if (x != undefined && y != undefined) {
                if (x != 0 || y != 0) {
                    let m = Mat4.translation(x, y, 0);
                    Mat4.multiply(m, this.currentContextState.transformMatrix, m);
                    newAction = m;
                }
            } else {
                newAction.applyMatrix = this.currentContextState.transformMatrix;
            }

            this[_renderActionList].push(newAction);
        }
        let vdo = this.getVDOArrays();
        let offset = vdo.verticesData.currentIndex;
        let painedIndexData = this._painedGraphicsMap[graphics];
        if (painedIndexData == undefined) {
            vdo.verticesData.append(graphics.verticesData);
            vdo.fragmentData.append(graphics.fragmentData);
            painedIndexData = {start: vdo.indexData.currentIndex, length: graphics.indexData.currentIndex};
            for (let i = 0; i < graphics.indexData.currentIndex; i++) {
                vdo.indexData.addIndex(graphics.indexData.getIndex(i) + offset);
            }
            this._painedGraphicsMap[graphics] = painedIndexData;
        } else {
            for (let i = 0; i < painedIndexData.length; i++) {
                let indexValue = vdo.indexData.getIndex(i + painedIndexData.start);
                vdo.indexData.addIndex(indexValue);
            }
        }
    }

    getVDOArrays() {
        return this.currentVDOArrays;
    }

    setVDOArrays(verticesData, fragmentData, transformData, indexData) {
        this.currentVDOArrays.verticesData = verticesData;
        this.currentVDOArrays.fragmentData = fragmentData;
        this.currentVDOArrays.transformMatrixData = transformData;
        this.currentVDOArrays.indexData = indexData;
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
        if (graphics != undefined) {
            graphics.verticesData.init();
            graphics.fragmentData.init();
            graphics.indexData.init();
            graphics.actionList.length = 0;
        } else {
            graphics = {
                verticesData: new VerticesData(vertexNum),
                fragmentData: new FragmentData(vertexNum),
                indexData: new IndexData(vertexNum),
                transformMatrixData: null,
                actionList: []
            };
        }

        this.tempVDOArrays.verticesData = graphics.verticesData;
        this.tempVDOArrays.fragmentData = graphics.fragmentData;
        this.tempVDOArrays.indexData = graphics.indexData;

        this._tempGraphics = graphics;

        this._tempActionList = this[_renderActionList];
        this[_renderActionList] = graphics.actionList;
        this.setVDOArrays(this.tempVDOArrays.verticesData, this.tempVDOArrays.fragmentData,
            null, this.tempVDOArrays.indexData);
    }

    endGraphics() {
        this[_stateStack].pop();
        this[_pathList] = this._tempPathArray;
        this[_renderActionList] = this._tempActionList;
        this.currentVDOArrays.verticesData = this.verticesData;
        this.currentVDOArrays.fragmentData = this.fragmentData;
        this.currentVDOArrays.transformMatrixData = this.transformMatrixData;
        this.currentVDOArrays.indexData = this.indexData;

        this._tempPathArray = null;
        this._tempActionList = null;
        this.tempVDOArrays.verticesData = null;
        this.tempVDOArrays.fragmentData = null;
        this.tempVDOArrays.indexData = null;
        this.tempVDOArrays.transformMatrixData = null;

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
        this._rawFillLine(inputInterface, stripeWidth, color, opacity, undefined, image);
    }

    _rawFillLine(inputInterface, lineWidth, color, opacity, filterType, image) {
        let pointsNum = inputInterface.getPointsNum();
        if (pointsNum < 2) return;
        let vod = this.getVDOArrays();
        let faceDirection = this.currentFaceVector;
        opacity = opacity || this.currentContextState.globalAlpha;
        filterType = filterType || this.currentContextState.filterType;
        color = color || this.currentContextState.fillStyle;
        let colorValue = Color.getInstance().convertStringToColor(color);
        let offset = vod.verticesData.currentIndex;
        let texture = null;
        if (image) {
            texture = this.webglRender.textureManager.getTexture(image, this.gl, true);
        }
        let plusTextureWidth = 0;
        let plusTextureHeight = 0;
        if (texture != null) {
            plusTextureWidth = texture.width / (pointsNum - 1);
            plusTextureHeight = texture.height;
        }

        let outputInterface = {
            setPoint: function (p, index) {
                vod.verticesData.setVerticesCoor(p.x, p.y, p.z, index + offset);
            },
            addPoint: function (p, lineIndex, pointIndexInTheLine) {
                if (vod.verticesData != null) {
                    vod.verticesData.addVerticesData(p.x, p.y, p.z, faceDirection[0], faceDirection[1], faceDirection[2]);
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
                    vod.fragmentData.addFragmentData(colorValue[0], colorValue[1], colorValue[2], opacity, uv[0], uv[1], -1, filterType);
                }
            }
        };

        let lineNum = LineToRectangle.generateRectanglesPoints(lineWidth, false, faceDirection, outputInterface, inputInterface);
        for (let k = 0; k < lineNum; k++) {
            let index = k * 4;
            vod.indexData.addIndex(offset + index);
            vod.indexData.addIndex(offset + index + 1);
            vod.indexData.addIndex(offset + index + 2);

            vod.indexData.addIndex(offset + index + 2);
            vod.indexData.addIndex(offset + index + 3);
            vod.indexData.addIndex(offset + index);
        }
        let action = new RenderAction(RenderAction.ACTION_FILL);
        action.textureIndex = -1;
        if (texture != null) action.textureIndex = texture.index;
        action.renderPointNumber = lineNum * 6;
        this[_renderActionList].push(action);
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

    draw() {
        if (this._tempGraphics != null) return;
        this.webglRender.initRending();
        this.webglRender.executeRenderAction(this[_renderActionList]);
        this[_renderActionList] = [];
        this.verticesData.init();
        this.fragmentData.init();
        this.transformMatrixData.init();
        this.indexData.init();
        this._painedGraphicsMap = {};
        // debug:
        // console.log("绘制调用次数：", this.webglRender.DEBUG_DRAW_COUNT);
    }

    loadImage(id, src, callbacks, split) {
        this.webglRender.textureManager.registerTexture(id, this.gl, null, src, callbacks, split);
    }

    getTexture(id,index) {
        return this.webglRender.textureManager.getTextureById(id,index);
    }

    /**
     * 清除所有当前生成贴图数据的image以及对应的imageData
     * 慎用！
     */
    clearImageCatches() {
        this.webglRender.textureManager.cleanImageData();
    }
}