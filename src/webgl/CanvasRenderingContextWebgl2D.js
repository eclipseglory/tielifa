"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ContextState = require("./ContextState.js");

var _ContextState2 = _interopRequireDefault(_ContextState);

var _CanvasDrawingStylesWebgl2D = require("./CanvasDrawingStylesWebgl2D.js");

var _CanvasDrawingStylesWebgl2D2 = _interopRequireDefault(_CanvasDrawingStylesWebgl2D);

var _Path3D = require("./Path3D.js");

var _Path3D2 = _interopRequireDefault(_Path3D);

var _SubPath3D = require("./SubPath3D.js");

var _SubPath3D2 = _interopRequireDefault(_SubPath3D);

var _Color = require("../utils/Color.js");

var _Color2 = _interopRequireDefault(_Color);

var _RenderAction = require("./RenderAction.js");

var _RenderAction2 = _interopRequireDefault(_RenderAction);

var _WebGLRender = require("./WebGLRender.js");

var _WebGLRender2 = _interopRequireDefault(_WebGLRender);

var _Tools = require("../utils/Tools.js");

var _Tools2 = _interopRequireDefault(_Tools);

var _Mat = require("../math/Mat4.js");

var _Mat2 = _interopRequireDefault(_Mat);

var _VerticesData = require("./VerticesData.js");

var _VerticesData2 = _interopRequireDefault(_VerticesData);

var _FragmentData = require("./FragmentData.js");

var _FragmentData2 = _interopRequireDefault(_FragmentData);

var _TransformMatrixData = require("./TransformMatrixData.js");

var _TransformMatrixData2 = _interopRequireDefault(_TransformMatrixData);

var _Vector = require("../math/Vector3.js");

var _Vector2 = _interopRequireDefault(_Vector);

var _GeometryTools = require("../geometry/GeometryTools.js");

var _GeometryTools2 = _interopRequireDefault(_GeometryTools);

var _Vector3 = require("../math/Vector2.js");

var _Vector4 = _interopRequireDefault(_Vector3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _canvas = Symbol('对应的Canvas');
var _stateStack = Symbol('状态栈');
var _stateArray = Symbol('状态数组，记录全部状态');
var _pathList = Symbol('路径列表');
var _renderActionList = Symbol('绘制动作List');
var _subpathCatch = Symbol('子Path缓存');

var FACE_NORMAL4 = new Float32Array(4);
var ORI_NORMAL4 = new Float32Array(4);
// let TEMP_VERTEX_COORD4DIM_ARRAY = [[0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1], [0, 0, 0, 1]];
var TEMP_VERTEX_COORD4DIM_ARRAY = [new Float32Array(4), new Float32Array(4), new Float32Array(4), new Float32Array(4)];

var CanvasRenderingContextWebgl2D = function () {
    function CanvasRenderingContextWebgl2D(canvas, properties) {
        _classCallCheck(this, CanvasRenderingContextWebgl2D);

        if (properties == null || properties == undefined) properties = [];
        for (var i = 0; i < TEMP_VERTEX_COORD4DIM_ARRAY.length; i++) {
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
        var FOV = properties['FOV'] || 20;
        // let t = Math.tan(FOV * Math.PI / 180);
        // this.defaultDepth = -canvas.height / (2 * t);
        this.maxBufferByteLength = properties['maxMemorySize'] || 1024 * 1024;
        this[_stateStack] = [];
        this[_stateArray] = [];
        this[_pathList] = [];
        this[_renderActionList] = [];
        this[_subpathCatch] = [];
        this.webglRender = new _WebGLRender2.default(this.gl, properties['maxTransformNum'], properties['maxTextureSize'], properties['projectionType'], FOV);
        var maxVertexNumber = this.maxBufferByteLength / 32;
        this.verticesData = new _VerticesData2.default(maxVertexNumber);
        // DEBUG :
        // console.log(maxVertexNumber,this.verticesData.totalByteLength);
        this.fragmetData = new _FragmentData2.default(maxVertexNumber);
        this.transformMatrixData = new _TransformMatrixData2.default(maxVertexNumber);
        this.webglRender.verticesData = this.verticesData;
        this.webglRender.fragmentData = this.fragmetData;
        this.webglRender.transformMatrixData = this.transformMatrixData;
        // this.translate(0, 0, this.defaultDepth);
        this.currentFaceNormal = new Float32Array(4);
        this.currentFaceNormal[2] = 1;
    }

    _createClass(CanvasRenderingContextWebgl2D, [{
        key: "clean",


        /**
         * clean all the path content and clear webgl depth buffer/color buffer
         */
        value: function clean() {
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

    }, {
        key: "clearRect",
        value: function clearRect(left, top, width, height) {
            this.clean();
        }

        /************** CanvasPathMethods ************************/

    }, {
        key: "beginPath",
        value: function beginPath() {
            this.currentPath.clean();
        }
    }, {
        key: "closePath",
        value: function closePath() {
            var path = this.currentPath;
            if (path.subPathNumber == 0) return;
            var lastSubPath = path.lastSubPath;
            lastSubPath.close();
            var x = lastSubPath.getPointX(0);
            var y = lastSubPath.getPointX(0);
            var z = lastSubPath.getPointX(0);
            var sid = lastSubPath.getPointStateId(0);
            var mid = lastSubPath.getPointMatrixId(0);
            var newSubPath = new _SubPath3D2.default();
            newSubPath.addPoint(x, y, z, sid, mid);
            path.addSubPath(newSubPath);
        }
    }, {
        key: "lineTo",
        value: function lineTo(x, y, z) {
            if (z == undefined) z = 0;
            var currentSubPath = this.currentPath;
            var lastSubPath = currentSubPath.lastSubPath;
            if (lastSubPath == undefined) {
                var subPath = new _SubPath3D2.default();
                currentSubPath.addSubPath(subPath);
                this.addPointInLastSubPath(x, y, z, true);
                return;
            }
            this.addPointInLastSubPath(x, y, z, true);
        }
    }, {
        key: "addPointInPath",
        value: function addPointInPath(x, y, z, path, applyTransform) {
            var currentState = this.currentContextState;
            var m = currentState.transformMatrix.matrix;
            if (applyTransform) {
                var tempVector = TEMP_VERTEX_COORD4DIM_ARRAY[0];
                tempVector[0] = x;
                tempVector[1] = y;
                tempVector[2] = z;
                tempVector[3] = 1;
                _Mat2.default.multiplyWithVertex(m, tempVector, tempVector);
                x = tempVector[0];
                y = tempVector[1];
                z = tempVector[2];
                currentState.fireDirty();
            }
            path.addPoint(x, y, z, currentState.id, currentState.transformMatrixId);
        }
    }, {
        key: "addPointInLastSubPath",
        value: function addPointInLastSubPath(x, y, z, applyTransform) {
            this.addPointInPath(x, y, z, this.currentPath.lastSubPath, applyTransform);
        }
    }, {
        key: "moveTo",
        value: function moveTo(x, y, z) {
            if (z == undefined) z = 0;
            var currentState = this.currentContextState;
            var currentSubPath = this.currentPath;
            var lastSubPath = currentSubPath.lastSubPath;
            if (lastSubPath != undefined && lastSubPath.pointsNumber < 2) {
                //这个subpath只要一个点，就用它作为新的subpath
                var m = currentState.transformMatrix.matrix;
                var tempVector = TEMP_VERTEX_COORD4DIM_ARRAY[0];
                tempVector[0] = x;
                tempVector[1] = y;
                tempVector[2] = z;
                tempVector[3] = 1;
                var temp = _Mat2.default.multiplyWithVertex(m, tempVector, tempVector);
                lastSubPath.setPoint(0, temp[0], temp[1], temp[2], currentState.id, currentState.transformMatrixId);
            } else {
                var subPath = new _SubPath3D2.default();
                currentSubPath.addSubPath(subPath);
                this.addPointInLastSubPath(x, y, z, true);
            }
        }
    }, {
        key: "rect",
        value: function rect(x, y, w, h, depth) {
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

    }, {
        key: "bezierCurveTo",
        value: function bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
            var oldx = cp1x;
            var oldy = cp1y;
            var currentPath = this.currentPath;
            var currentState = this.currentContextState;
            var lastSubPath = currentPath.lastSubPath;
            var tempVector = TEMP_VERTEX_COORD4DIM_ARRAY[0];
            var defaultZ = 0;

            tempVector[0] = cp1x;
            tempVector[1] = cp1y;
            tempVector[2] = 0;
            tempVector[3] = 1;
            var m1 = this.currentContextState.transformMatrix.matrix;
            _Mat2.default.multiplyWithVertex(m1, tempVector, tempVector);
            cp1x = tempVector[0];
            cp1y = tempVector[1];
            defaultZ = tempVector[2];

            tempVector[0] = cp2x;
            tempVector[1] = cp2y;
            tempVector[2] = 0;
            tempVector[3] = 1;
            _Mat2.default.multiplyWithVertex(m1, tempVector, tempVector);
            cp2x = tempVector[0];
            cp2y = tempVector[1];

            tempVector[0] = x;
            tempVector[1] = y;
            tempVector[2] = 0;
            tempVector[3] = 1;
            _Mat2.default.multiplyWithVertex(m1, tempVector, tempVector);
            x = tempVector[0];
            y = tempVector[1];

            var cp0x = cp1x;
            var cp0y = cp1y;

            if (lastSubPath == undefined) {
                this.moveTo(oldx, oldy);
            } else {
                var lastIndex = lastSubPath.pointsNumber - 1;
                var x0 = lastSubPath.getPointX(lastIndex);
                var y0 = lastSubPath.getPointY(lastIndex);
                if (x0 != cp1x && y0 != cp1y) {
                    cp0x = x0;
                    cp0y = y0;
                }
            }
            // 二阶导数：6(1-t)(p2-2p1+p0) + 6t(p3-2p2+p1)
            // 计算出三姐导数：6(p3 - 3p2 + 3p1-p0) 不知道算没算错 ：）
            var sx = 6 * (x - 3 * cp2x + 3 * cp1x - cp0x);
            var sy = 6 * (y - 3 * cp2y + 3 * cp1y - cp0y);
            var r = 1 / (sx * sx + sy * sy);
            var delta = Math.pow(r, 1 / 6);
            var temp = TEMP_VERTEX_COORD4DIM_ARRAY[0];
            var segment = delta;
            for (; segment < 1; segment += delta) {
                _GeometryTools2.default.cubicBezier(segment, cp0x, cp0y, cp1x, cp1y, cp2x, cp2y, x, y, temp);
                this.addPointInLastSubPath(temp[0], temp[1], defaultZ, false);
            }
            if (segment > 1 && segment != 1) {
                this.addPointInLastSubPath(x, y, defaultZ, false);
            }
            currentState.fireDirty();
        }

        /**
         * 绘制Quadratice贝塞尔，3个控制点
         * @param cpx
         * @param cpy
         * @param x
         * @param y
         */

    }, {
        key: "quadraticCurveTo",
        value: function quadraticCurveTo(cpx, cpy, x, y) {
            var currentPath = this.currentPath;
            var currentState = this.currentContextState;
            var lastSubPath = currentPath.lastSubPath;
            var m = TEMP_VERTEX_COORD4DIM_ARRAY[0];
            m[0] = cpx;
            m[1] = cpy;
            m[2] = 0;
            m[3] = 1;
            var m1 = this.currentContextState.transformMatrix.matrix;
            _Mat2.default.multiplyWithVertex(m1, m, m);
            cpx = m[0];
            cpy = m[1];
            var cpz = m[2];
            m[0] = x;
            m[1] = y;
            m[2] = 0;
            m[3] = 1;
            _Mat2.default.multiplyWithVertex(m1, m, m);
            x = m[0];
            y = m[1];
            var z = m[2];

            var cp0x = cpx;
            var cp0y = cpy;

            if (lastSubPath == undefined) {
                var subPath = new _SubPath3D2.default();
                currentPath.addSubPath(subPath);
                this.addPointInLastSubPath(cpx, cpy, cpz, false);
            } else {
                var lastIndex = lastSubPath.pointsNumber - 1;
                var x0 = lastSubPath.getPointX(lastIndex);
                var y0 = lastSubPath.getPointY(lastIndex);
                if (x0 != cpx && y0 != cpy) {
                    cp0x = x0;
                    cp0y = y0;
                }
            }
            if (cp0x == cpx && cp0y == cpy) {
                this.addPointInLastSubPath(x, y, z, false);
                return;
            }
            // 2阶导数：2(p2-2p1+p0)
            var sx = 2 * (x - 2 * cpx + cp0x);
            var sy = 2 * (y - 2 * cpy + cp0y);
            var r = 1 / (sx * sx + sy * sy);
            var delta = Math.pow(r, 0.25);
            var temp = TEMP_VERTEX_COORD4DIM_ARRAY[0];
            var segment = delta;
            for (; segment <= 1; segment += delta) {
                _GeometryTools2.default.quadraticBezier(segment, cp0x, cp0y, cpx, cpy, x, y, temp);
                this.addPointInLastSubPath(temp[0], temp[1], cpz, false);
            }
            this.addPointInLastSubPath(x, y, z, false);
            currentState.fireDirty();
        }

        // 没有实现这个椭圆的：arcTo(x1: number, y1: number, x2: number, y2: number, radiusX: number, radiusY: number, rotation: number): void;

    }, {
        key: "arcTo",
        value: function arcTo(x1, y1, x2, y2, radius) {
            if (radius < 0) throw new Error('IndexError: Radius value wrong');
            var subpath = this.currentPath.lastSubPath;
            var startx = 0;
            var starty = 0;
            if (subpath == undefined) {
                subpath = new _SubPath3D2.default();
                this.currentPath.addSubPath(subpath);
                this.moveTo(x1, y1);
                return;
            } else {
                var sx = subpath.getPointX(subpath.pointsNumber - 1);
                var sy = subpath.getPointY(subpath.pointsNumber - 1);
                var sz = subpath.getPointZ(subpath.pointsNumber - 1);
                var testVertex = TEMP_VERTEX_COORD4DIM_ARRAY[0];
                testVertex[0] = sx;
                testVertex[1] = sy;
                testVertex[2] = sz;
                testVertex[3] = 1;
                var tm = this.currentContextState.transformMatrix.matrix;
                var tempM = _Mat2.default.TEMP_MAT4[0];
                _Mat2.default.copy(tm, tempM);
                _Mat2.default.inverse(tempM, tempM);
                _Mat2.default.multiplyWithVertex(tempM, testVertex, testVertex);
                if (_Tools2.default.equals(sx, x1) && _Tools2.default.equals(sy, y1) || _Tools2.default.equals(x1, x2) && _Tools2.default.equals(y1, y2) || radius == 0) {
                    this.lineTo(x1, y1);
                    return;
                }
                startx = testVertex[0];
                starty = testVertex[1];
            }

            var vector1 = new _Vector4.default(startx - x1, starty - y1);
            var vector2 = new _Vector4.default(x2 - x1, y2 - y1);

            _Vector4.default.normalize(vector1, vector1);
            _Vector4.default.normalize(vector2, vector2);

            var vector3 = new _Vector4.default();
            _Vector4.default.plus(vector3, vector1, vector2);
            _Vector4.default.normalize(vector3, vector3);
            var radian1 = Math.acos(_Vector4.default.dot(vector1, vector3));
            if (_Tools2.default.equals(radian1 * 2 % Math.PI, 0)) {
                this.lineTo(x1, y1);
                return;
            }
            var sin = Math.sin(radian1);
            var length2 = radius / sin;

            var rx = vector3.x * length2 + x1;
            var ry = vector3.y * length2 + y1;

            var center = { x: rx, y: ry };
            var linep1 = { x: x1, y: y1 };
            var linep2 = { x: startx, y: starty };
            var linep3 = { x: x2, y: y2 };
            var tangenp1 = _GeometryTools2.default.getProjectionPointOnLine(center, linep1, linep2);
            var tangenp2 = _GeometryTools2.default.getProjectionPointOnLine(center, linep1, linep3);
            var tv1 = new _Vector4.default(tangenp1.x - rx, tangenp1.y - ry);
            var tv2 = new _Vector4.default(tangenp2.x - rx, tangenp2.y - ry);
            _Vector4.default.normalize(tv1, tv1);
            _Vector4.default.normalize(tv2, tv2);

            function adjustAngle(angle) {
                var PI2 = 2 * Math.PI;
                var beishu = Math.floor(Math.abs(angle / PI2));
                // if (Math.abs(angle) > PI2) beishu++;
                if (angle < 0) {
                    angle += beishu * PI2;
                }
                if (angle >= PI2) {
                    angle -= beishu * PI2;
                }
                return angle;
            }

            var startTheta = Math.atan2(tv1.y, tv1.x);
            var testst = startTheta;
            testst = adjustAngle(testst);
            var endTheta = Math.atan2(tv2.y, tv2.x);
            var testet = endTheta;
            testet = adjustAngle(testet);
            var flag = false;
            if (Math.abs(testst - testet) > Math.PI) {
                flag = true;
            }
            this.arc(rx, ry, radius, startTheta, endTheta, flag);
        }
    }, {
        key: "ellipse",
        value: function ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
            if (radiusX < 0 || radiusY < 0) throw new Error('IndexError.半径必须不小于0. Radius should not be smaller than zero. BanJing BiXu BuXiaoYu Ling');
            if (radiusX == 0 || radiusY == 0) return;
            if (anticlockwise == undefined) anticlockwise = false;

            var subpath = this.currentPath.lastSubPath;
            if (subpath == undefined) {
                subpath = new _SubPath3D2.default();
                this.currentPath.addSubPath(subpath);
            }

            var currentMatrix = _Mat2.default.TEMP_MAT4[0];
            _Mat2.default.translationMatrix(currentMatrix, x, y, 0);
            var tm = this.currentContextState.transformMatrix.matrix;
            _Mat2.default.multiply(currentMatrix, tm, currentMatrix);
            var transformMatrix = _Mat2.default.TEMP_MAT4[1];
            _Mat2.default.rotationZMatrix(transformMatrix, rotation);
            _Mat2.default.multiply(currentMatrix, currentMatrix, transformMatrix);
            /*
            * 设一个矩阵：
            * [ radiusX,0,0,0
            *  0, radiusY,0,0
            *  0,0,1,0
            *  0,0,0,1]
            */
            _Mat2.default.identityMatrix(transformMatrix);
            transformMatrix[0] = radiusX;
            transformMatrix[5] = radiusY;
            _Mat2.default.multiply(currentMatrix, currentMatrix, transformMatrix);

            /*
              这是一个笨方法(stupid method)，用一个长度为1的线，对它进行变换，然后计算线程长度的缩放情况来确定当前的缩放倍数
             */
            var testPoint1 = TEMP_VERTEX_COORD4DIM_ARRAY[0];
            testPoint1[0] = 0;
            testPoint1[1] = 0;
            testPoint1[2] = 0;
            testPoint1[3] = 1;
            _Mat2.default.multiplyWithVertex(tm, testPoint1, testPoint1);
            var testX0 = testPoint1[0];
            var testY0 = testPoint1[1];

            testPoint1[0] = 1;
            testPoint1[1] = 0;
            testPoint1[2] = 0;
            testPoint1[3] = 1;
            _Mat2.default.multiplyWithVertex(tm, testPoint1, testPoint1);
            var testX1 = testPoint1[0];
            var testY1 = testPoint1[1];
            var scale = (testX1 - testX0) * (testX1 - testX0) + (testY1 - testY0) * (testY1 - testY0);
            scale = Math.sqrt(scale);

            var realRadius1 = Math.max(radiusX * scale, radiusY * scale); // 这个值要根据当前缩放算一下
            var deltaTheta = Math.asin(1 / realRadius1) * 2;

            var thetaVector = new _Vector2.default();

            startAngle = adjustAngle(startAngle);
            endAngle = adjustAngle(endAngle);

            if (startAngle > endAngle && !anticlockwise || startAngle < endAngle && anticlockwise) {
                if (startAngle < 0 || endAngle < 0) {
                    endAngle -= 2 * Math.PI;
                    if (endAngle == startAngle || Math.abs(endAngle - startAngle) <= _Tools2.default.EPSILON) endAngle -= 2 * Math.PI;
                }
                if (startAngle > 0 || endAngle > 0) {
                    endAngle += 2 * Math.PI;
                    if (endAngle == startAngle || Math.abs(endAngle - startAngle) <= _Tools2.default.EPSILON) endAngle += 2 * Math.PI;
                }
            }
            /**
             * 把椭圆点的计算抽取出来，形成了几个矩阵，然后先让这些矩阵和当前变换矩阵相乘
             * 再通过已经应用了变换后的矩阵计算坐标点，这样省去了用lineTo一个一个点和矩阵相乘
             */
            if (anticlockwise) {
                for (var theta = startAngle; theta > endAngle; theta -= deltaTheta) {
                    if (Math.abs(theta - startAngle) >= _Tools2.default.PI2) {
                        return;
                    }
                    var _s = Math.sin(theta);
                    var _c = Math.cos(theta);
                    thetaVector.x = _c;
                    thetaVector.y = _s;
                    thetaVector.z = 0;
                    _Mat2.default.multiplyWithVertex(currentMatrix, thetaVector.value, thetaVector.value);
                    this.addPointInLastSubPath(thetaVector.x, thetaVector.y, thetaVector.z, false);
                }
            } else {
                for (var _theta = startAngle; _theta < endAngle; _theta += deltaTheta) {
                    if (Math.abs(_theta - startAngle) >= _Tools2.default.PI2) {
                        return;
                    }

                    var _s2 = Math.sin(_theta);
                    var _c2 = Math.cos(_theta);
                    thetaVector.x = _c2;
                    thetaVector.y = _s2;
                    thetaVector.z = 0;
                    _Mat2.default.multiplyWithVertex(currentMatrix, thetaVector.value, thetaVector.value);
                    this.addPointInLastSubPath(thetaVector.x, thetaVector.y, thetaVector.z, false);
                    // 老的计算方法是先计算坐标后再进行变换：(lineTo会自动将点进行变换)
                    // GeometryTools.getEllipsePointWithRadian(x, y, radiusX, radiusY, theta, rotation, nextPoint);
                    // this.lineTo(nextPoint[0], nextPoint[1]);
                }
            }

            var s = Math.sin(endAngle);
            var c = Math.cos(endAngle);
            thetaVector.x = c;
            thetaVector.y = s;
            thetaVector.z = 0;
            _Mat2.default.multiplyWithVertex(currentMatrix, thetaVector.value, thetaVector.value);
            this.addPointInLastSubPath(thetaVector.x, thetaVector.y, thetaVector.z, false);
            // let nextPoint = TEMP_VERTEX_COORD4DIM_ARRAY[0];
            // GeometryTools.getEllipsePointWithRadian(x, y, radiusX, radiusY, endAngle, rotation, nextPoint);
            // this.lineTo(nextPoint[0], nextPoint[1]);

            function adjustAngle(angle) {
                var PI2 = 2 * Math.PI;
                var beishu = Math.floor(Math.abs(angle / PI2)) + 1;
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
    }, {
        key: "arc",
        value: function arc(x, y, radius, startAngle, endAngle, anticlockwise) {
            this.ellipse(x, y, radius, radius, 0, startAngle, endAngle, anticlockwise);
        }

        /*************************** sate **************************/

        /**
         * push state on state stack
         * 将当前状态放入状态栈中
         */

    }, {
        key: "save",
        value: function save() {
            // 取出最后一个状态，克隆一个新状态，然后把新状态加入到栈内
            var currentState = this.currentContextState;
            var stateClone = currentState.clone();
            this[_stateStack].push(stateClone);
            // TODO 可能要取消这个状态数组了
            // this[_stateArray].push(stateClone);
            stateClone.id = this[_stateArray].length - 1;
        }

        /**
         * pop state stack and restore state
         * 将当前状态弹出栈，即恢复之前的状态
         */

    }, {
        key: "restore",
        value: function restore() {
            // 弹出栈底状态
            if (this[_stateStack].length != 0) {
                this[_stateStack].pop();
            }
        }
    }, {
        key: "translate",
        value: function translate(x, y, z) {
            this.currentContextState.translate(x, y, z);
        }

        /**
         * 默认2D是按照Z轴旋转
         * @param radian
         */

    }, {
        key: "rotate",
        value: function rotate(radian) {
            this.currentContextState.rotateZ(radian);
        }
    }, {
        key: "rotateX",
        value: function rotateX(radian) {
            this.currentContextState.rotateX(radian);
        }
    }, {
        key: "rotateY",
        value: function rotateY(radian) {
            this.currentContextState.rotateY(radian);
        }
    }, {
        key: "scale",
        value: function scale(scaleX, scaleY, scaleZ) {
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

    }, {
        key: "setTransform",
        value: function setTransform(scaleX, skewY, skewX, scaleY, tx, ty) {
            _Mat2.default.identityMatrix(this.currentContextState.transformMatrix.matrix);
            var m = this.currentContextState.transformMatrix.matrix;
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

    }, {
        key: "transform",
        value: function transform(scaleX, skewY, skewX, scaleY, tx, ty) {
            var m = _Mat2.default.TEMP_MAT4[0];
            _Mat2.default.identityMatrix(m);
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

        /*********************** 绘制 */ //////////////

    }, {
        key: "drawImage",
        value: function drawImage(image, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, depth) {
            depth = depth || 0;
            var texture = this.webglRender.textureManager.getTexture(image, this.gl, true);
            var action = new _RenderAction2.default(_RenderAction2.default.ACTION_FILL);
            action.textureIndex = texture.index;
            var left = void 0,
                top = void 0,
                right = void 0,
                bottom = void 0; // 图形对应矩形的四个点
            var tx = void 0,
                ty = void 0,
                tr = void 0,
                tb = void 0; // 贴图对应的四个点
            // 只有x,y传入的调用
            if (arguments.length == 3) {
                left = srcX;
                top = srcY;
                right = srcX + image.width;
                bottom = srcY + image.height;
                tx = texture.x;
                tr = texture.x + texture.width;
                ty = texture.y;
                tb = texture.y + texture.height;
            }
            if (arguments.length == 4) {
                left = srcX;
                top = srcY;
                right = srcX + image.width;
                bottom = srcY + image.height;
                tx = texture.x;
                tr = texture.x + texture.width;
                ty = texture.y;
                tb = texture.y + texture.height;
                depth = srcWidth;
            }
            // 有x,y,width,height传入的调用
            if (arguments.length == 5) {
                left = srcX;
                top = srcY;
                right = srcX + srcWidth;
                bottom = srcY + srcHeight;
                tx = texture.x;
                tr = texture.x + texture.width;
                ty = texture.y;
                tb = texture.y + texture.height;
            }
            if (arguments.length == 6) {
                left = srcX;
                top = srcY;
                right = srcX + srcWidth;
                bottom = srcY + srcHeight;
                tx = texture.x;
                tr = texture.x + texture.width;
                ty = texture.y;
                tb = texture.y + texture.height;
                depth = dstX;
            }
            // 有9或10个参数传入的调用，即要调整贴图坐标
            if (arguments.length == 9 || arguments.length == 10) {
                left = dstX;
                top = dstY;
                right = dstX + dstWidth;
                bottom = dstY + dstHeight;
                tx = texture.x + srcX;
                tr = texture.x + srcX + srcWidth;
                ty = texture.y + srcY;
                tb = texture.y + srcY + srcHeight;
            }
            this.beginPath();
            this.rect(left, top, right - left, bottom - top, depth);

            var opacity = this.currentContextState.globalAlpha;
            var pathList = this[_pathList];
            this[_renderActionList].push(action);
            var texCoordArray = new Array(4);
            texCoordArray[0] = [tx, ty]; // 左上角
            texCoordArray[1] = [tr, ty]; // 右上角
            texCoordArray[2] = [tr, tb]; // 右下角
            texCoordArray[3] = [tx, tb]; // 左下角
            var color = [255, 255, 255]; //白色，在glsl里会成为一个1,1,1的向量，这样就不会改变贴图数据了
            action.verticesData = this.verticesData;
            action.fragmentData = this.fragmetData;
            action.collectVertexDataForFill(pathList, color, opacity, texCoordArray, this.currentFaceVector);
        }
    }, {
        key: "fill",
        value: function fill() {
            var fillColor = _Color2.default.getInstance().convertStringToColor(this.currentContextState.fillStyle);
            var opacity = this.currentContextState.globalAlpha;
            var pathList = this[_pathList];
            var action = new _RenderAction2.default(_RenderAction2.default.ACTION_FILL);
            action.verticesData = this.verticesData;
            action.fragmentData = this.fragmetData;
            this[_renderActionList].push(action);
            action.collectVertexDataForFill(pathList, fillColor, opacity * fillColor[3], [0, 0], this.currentFaceVector);
        }
    }, {
        key: "fillRect",
        value: function fillRect(x, y, w, h) {
            this.beginPath();
            this.rect(x, y, w, h);
            this.fill();
        }

        /**
         * @deprecated
         */

    }, {
        key: "stroke2",
        value: function stroke2() {
            var strokeColor = _Color2.default.getInstance().convertStringToColor(this.currentContextState.strokeStyle);
            var opacity = this.currentContextState.globalAlpha;
            var pathList = this[_pathList];
            var action = new _RenderAction2.default(_RenderAction2.default.ACTION_STROKE);
            this[_renderActionList].push(action);
            action.collectVertexData(pathList, strokeColor, opacity * strokeColor[3], [0, 0]);
        }
    }, {
        key: "stroke",
        value: function stroke() {
            var strokeColor = _Color2.default.getInstance().convertStringToColor(this.currentContextState.strokeStyle);
            var opacity = this.currentContextState.globalAlpha;
            var pathList = this[_pathList];
            var lineWidth = this.currentContextState.lineWidth;
            var action = new _RenderAction2.default(_RenderAction2.default.ACTION_FILL);
            action.verticesData = this.verticesData;
            action.fragmentData = this.fragmetData;
            this[_renderActionList].push(action);
            action.collectVertexDataForStroke(pathList, strokeColor, opacity * strokeColor[3], [0, 0], lineWidth, this.currentFaceVector);
        }

        //////////////////// ImageData相关 /////////////////////////////

    }, {
        key: "createImageData",
        value: function createImageData(width, height) {
            if (arguments.length == 1) {
                var imgData = width;
                width = imgData.width;
                height = imgData.height;
            }
            var array = new Uint8ClampedArray(width * height * 4);
            var data = new ImageData(array, width, height);
            return data;
        }

        //******************** 扩展接口 *****************************//

    }, {
        key: "turnOnLight",
        value: function turnOnLight() {
            this.webglRender.enableLight(true);
        }
    }, {
        key: "turnOffLight",
        value: function turnOffLight() {
            this.webglRender.enableLight(false);
        }
    }, {
        key: "setLightPosition",
        value: function setLightPosition(x, y, z) {
            this.webglRender.setLightPosition(x, y, z);
        }
    }, {
        key: "fillOrStroke",
        value: function fillOrStroke(fillColor, strokeColor) {
            if (fillColor != undefined) {
                this.fillStyle = fillColor;
                this.fill();
            }
            if (strokeColor != undefined) {
                this.strokeStyle = strokeColor;
                this.stroke();
            }
        }
    }, {
        key: "drawRectangle",
        value: function drawRectangle(x, y, w, h, fillColor, strokeColor) {
            this.save();
            this.beginPath();
            this.rect(x, y, w, h);
            this.fillOrStroke(fillColor, strokeColor);
            this.restore();
        }
    }, {
        key: "drawEllipse",
        value: function drawEllipse(x, y, r1, r2, fillColor, strokeColor, rotation) {
            this.save();
            this.beginPath();
            this.ellipse(x, y, r1, r2, rotation, 0, _Tools2.default.PI2, false);
            this.closePath();
            this.fillOrStroke(fillColor, strokeColor);
            this.restore();
        }
    }, {
        key: "drawCircle",
        value: function drawCircle(x, y, r, fillColor, strokeColor) {
            this.drawEllipse(x, y, r, r, fillColor, strokeColor, 0);
        }
    }, {
        key: "draw",
        value: function draw() {
            this.webglRender.initRending();
            this.webglRender.executeRenderAction(this[_renderActionList], this[_stateArray]);
            this[_renderActionList] = [];
            this[_stateArray] = [];
            this.verticesData.init();
            this.fragmetData.init();
            this.transformMatrixData.init();
            // debug:
            // console.log("绘制调用次数：", this.webglRender.DEBUG_DRAW_COUNT);
        }
    }, {
        key: "currentContextState",
        get: function get() {
            if (this[_stateStack].length == 0) {
                // 状态栈永远不为空
                var state = new _ContextState2.default(new _CanvasDrawingStylesWebgl2D2.default());
                this[_stateStack].push(state);
                this[_stateArray].push(state);
                state.id = this[_stateArray].length - 1;
            }
            return this[_stateStack][this[_stateStack].length - 1];
        }
    }, {
        key: "currentPath",
        get: function get() {
            if (this[_pathList].length == 0) {
                this[_pathList].push(new _Path3D2.default());
            }
            return this[_pathList][this[_pathList].length - 1];
        }

        /**************** 下面是标准接口实现 *************************/

        /**
         * back-reference to the canvas
         * Canvas的回引用
         * @returns {canvas}
         */

    }, {
        key: "canvas",
        get: function get() {
            return this[_canvas];
        }
    }, {
        key: "strokeStyle",
        set: function set(stroke) {
            this.currentContextState.strokeStyle = stroke;
        },
        get: function get() {
            return this.currentContextState.strokeStyle;
        }
    }, {
        key: "currentFaceVector",
        get: function get() {
            var m = this.currentContextState.transformMatrix.matrix;
            var temp1 = _Vector2.default.TEMP_VECTORS[0];
            var temp2 = _Vector2.default.TEMP_VECTORS[1];
            _Mat2.default.multiplyWithVertex(m, FACE_NORMAL4, temp1.value);
            _Mat2.default.multiplyWithVertex(m, ORI_NORMAL4, temp2.value);
            this.currentFaceNormal[0] = temp1.x - temp2.x;
            this.currentFaceNormal[1] = temp1.y - temp2.y;
            this.currentFaceNormal[2] = temp1.z - temp2.z;
            return this.currentFaceNormal;
        }
    }, {
        key: "fillStyle",
        set: function set(fill) {
            this.currentContextState.fillStyle = fill;
        },
        get: function get() {
            return this.currentContextState.fillStyle;
        }
    }, {
        key: "globalAlpha",
        set: function set(alpha) {
            this.currentContextState.globalAlpha = alpha;
        },
        get: function get() {
            return this.currentContextState.globalAlpha;
        }

        /**
         * set stroke lineWidth
         * 设置stroke时的线宽度
         * @param lineWidth
         */

    }, {
        key: "lineWidth",
        set: function set(lineWidth) {
            this.currentContextState.lineWidth = lineWidth;
        },
        get: function get() {
            return this.currentContextState.lineWidth;
        }
    }]);

    return CanvasRenderingContextWebgl2D;
}();

exports.default = CanvasRenderingContextWebgl2D;