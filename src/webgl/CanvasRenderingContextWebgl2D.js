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

var _Mat3 = require("../math/Mat3.js");

var _Mat4 = _interopRequireDefault(_Mat3);

var _Vector = require("../math/Vector3.js");

var _Vector2 = _interopRequireDefault(_Vector);

var _Vector3 = require("../math/Vector2.js");

var _Vector4 = _interopRequireDefault(_Vector3);

var _GeometryTools = require("../geometry/GeometryTools.js");

var _GeometryTools2 = _interopRequireDefault(_GeometryTools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _canvas = Symbol('对应的Canvas');
var _stateStack = Symbol('状态栈');
var _stateArray = Symbol('状态数组，记录全部状态');
var _pathList = Symbol('路径列表');
var _renderActionList = Symbol('绘制动作List');
var _subpathCatch = Symbol('子Path缓存');

var FACE_NORMAL4 = [0, 0, 1, 0];

var CanvasRenderingContextWebgl2D = function () {
    function CanvasRenderingContextWebgl2D(canvas, properties) {
        _classCallCheck(this, CanvasRenderingContextWebgl2D);

        if (properties == null || properties == undefined) properties = [];
        this[_canvas] = canvas;
        if (canvas == null || canvas == undefined) throw new Error('canvas can not be undefined or null');
        this.gl = canvas.getContext('webgl');
        if (this.gl == undefined) throw new Error('Current canvas doesnt support WebGL');
        // this.defaultDepth = -canvas.height * 2;
        var FOV = properties['FOV'] || 20;
        var t = Math.tan(FOV * Math.PI / 180);
        this.defaultDepth = -canvas.height / (2 * t);
        this.maxBufferByteLength = properties['maxMemorySize'] || 1024 * 1024;
        this[_stateStack] = [];
        this[_stateArray] = [];
        this[_pathList] = [];
        this[_renderActionList] = [];
        this[_subpathCatch] = [];
        this.webglRender = new _WebGLRender2.default(this.gl, properties['maxTransformNum'], properties['maxTextureSize'], properties['projectionType'], this.defaultDepth);
        var maxVertexNumber = this.maxBufferByteLength / 32;
        this.verticesData = new _VerticesData2.default(maxVertexNumber);
        // DEBUG :
        // console.log(maxVertexNumber,this.verticesData.totalByteLength);
        this.fragmetData = new _FragmentData2.default(maxVertexNumber);
        this.transformMatrixData = new _TransformMatrixData2.default(maxVertexNumber);
        this.webglRender.verticesData = this.verticesData;
        this.webglRender.fragmentData = this.fragmetData;
        this.webglRender.transformMatrixData = this.transformMatrixData;
        this.translate(0, 0, this.defaultDepth);
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

        // 没有实现的有这些：
        // arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;

    }, {
        key: "beginPath",
        value: function beginPath() {
            this.currentPath.clean();
        }

        /**
         * 封闭当前Path，下面是规范说明
         * The closePath() method must do nothing if the object's path has no subpaths.
         * Otherwise, it must mark the last subpath as closed,
         * create a new subpath whose first point is the same as the previous subpath's first point,
         * and finally add this new subpath to the path.
         */

    }, {
        key: "closePath",
        value: function closePath() {
            // let path = this.currentPath;
            // if (path.subPathNumber == 0) return;
            // let lastSubPath = path.lastSubPath;
            // lastSubPath.close();
            // let firstPoint = lastSubPath.getPoint(0);
            // let newSubPath = new SubPath3D(firstPoint);
            // path.addSubPath(newSubPath);

            var path = this.currentPath;
            if (path.subPathNumber == 0) return;
            var lastSubPath = path.lastSubPath;
            lastSubPath.close();
            var x = lastSubPath.getPointX(0);
            var y = lastSubPath.getPointX(0);
            var z = lastSubPath.getPointX(0);
            var sid = lastSubPath.getPointStateId(0);
            var mid = lastSubPath.getPointMatrixId(0);
            // let firstPoint = lastSubPath.getPoint(0);
            var newSubPath = new _SubPath3D2.default();
            newSubPath.addPoint(x, y, z, sid, mid);
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

    }, {
        key: "lineTo",
        value: function lineTo(x, y, z) {
            var currentSubPath = this.currentPath;
            var lastSubPath = currentSubPath.lastSubPath;
            if (lastSubPath == undefined) {
                this.moveTo(x, y, z);
                return;
            }
            if (z == undefined) z = 0;
            var currentState = this.currentContextState;
            var m = currentState.transformMatrix.matrix;
            var temp = _Mat2.default.multiplyWithVertex(m, [x, y, z, 1]);
            lastSubPath.addPoint(temp[0], temp[1], temp[2], currentState.id, currentState.transformMatrixId);
            currentState.fireDirty();
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
                var temp = _Mat2.default.multiplyWithVertex(m, [x, y, z, 1]);
                lastSubPath.setPoint(0, temp[0], temp[1], temp[2], currentState.id, currentState.transformMatrixId);
            } else {
                var subPath = new _SubPath3D2.default();
                currentSubPath.addSubPath(subPath);
                var _m = currentState.transformMatrix.matrix;
                var _temp = _Mat2.default.multiplyWithVertex(_m, [x, y, z, 1]);
                subPath.addPoint(_temp[0], _temp[1], _temp[2], currentState.id, currentState.transformMatrixId);
                currentState.fireDirty();
            }
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
            var lastSubPath = this.currentPath.lastSubPath;
            var cp0x = cp1x;
            var cp0y = cp1y;

            if (lastSubPath == undefined) {
                this.moveTo(cp1x, cp1y);
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
            var temp = _Vector4.default.TEMP_VECTORS[0];
            var segment = 0;
            for (; segment < 1; segment += delta) {
                _GeometryTools2.default.cubicBezier(segment, cp0x, cp0y, cp1x, cp1y, cp2x, cp2y, x, y, temp.value);
                this.lineTo(temp.x, temp.y);
            }
            if (segment > 1 && segment != 1) {
                this.lineTo(x, y);
            }
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
            var lastSubPath = this.currentPath.lastSubPath;
            var cp0x = cpx;
            var cp0y = cpy;

            if (lastSubPath == undefined) {
                this.moveTo(cpx, cpy);
            } else {
                var lastIndex = lastSubPath.pointsNumber - 1;
                var x0 = lastSubPath.getPointX(lastIndex);
                var y0 = lastSubPath.getPointY(lastIndex);
                if (x0 != cpx && y0 != cpy) {
                    cp0x = x0;
                    cp0y = y0;
                }
            }
            // 2阶导数：2(p2-2p1+p0)
            var sx = 2 * (x - 2 * cpx + cp0x);
            var sy = 2 * (y - 2 * cpy + cp0y);
            var r = 1 / (sx * sx + sy * sy);
            var delta = Math.pow(r, 0.25);
            var temp = _Vector4.default.TEMP_VECTORS[0];
            var segment = 0;
            for (; segment < 1; segment += delta) {
                _GeometryTools2.default.quadraticBezier(segment, cp0x, cp0y, cpx, cpy, x, y, temp.value);
                this.lineTo(temp.x, temp.y);
            }
            if (segment > 1 && segment != 1) {
                this.lineTo(x, y);
            }
        }

        // arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
        // arcTo(x1: number, y1: number, x2: number, y2: number, radiusX: number, radiusY: number, rotation: number): void;
        /**
         * 方法实现有错误！！
         * @deprecated
         * @param x1
         * @param y1
         * @param x2
         * @param y2
         * @param radiusX
         * @param radiusY
         * @param rotation
         * @returns {{center: number[], theta: number[]}}
         */

    }, {
        key: "arcTo",
        value: function arcTo(x1, y1, x2, y2, radiusX, radiusY, rotation) {
            if (arguments.length == 5) {
                radiusY = radiusX;
                rotation = 0;
            }
            if (radiusX < 0 || radiusY < 0) throw new Error('IndexError,radius should not be negative value');
            if (rotation == undefined) rotation = 0;
            var lastSubPath = this.currentPath.lastSubPath;
            if (lastSubPath == undefined) {
                this.moveTo(x1, y1);
                lastSubPath = this.currentPath.lastSubPath;
            } else {
                var lastIndex = lastSubPath.pointsNumber - 1;
                var x0 = lastSubPath.getPointX(lastIndex);
                var y0 = lastSubPath.getPointY(lastIndex);
                if (x0 != x1 && y0 != y1) {
                    this.lineTo(x1, y1);
                }
            }

            if (x1 == x2 && y1 == y2) {
                this.lineTo(x2, y2);
                return;
            }

            var result = _GeometryTools2.default.arcConversionEndpointToCenter(x1, y1, x2, y2, radiusX, radiusY, rotation);
            var theta = result.theta;
            var deltaTheta = result.deltaTheta;
            var cx = result.x;
            var cy = result.y;
            this.ellipse(cx, cy, radiusX, radiusY, rotation, theta, theta + deltaTheta);
            this.lineTo(x2, y2);
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

            var realRadius = Math.max(radiusX, radiusY); // 这个值要根据当前缩放算一下
            var plusAngle = Math.asin(1 / realRadius) * 2;
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

            if (anticlockwise) {
                for (var theta = startAngle; theta > endAngle; theta -= plusAngle) {
                    if (Math.abs(theta - startAngle) >= _Tools2.default.PI2) {
                        return;
                    }
                    var _nextPoint = _Vector2.default.TEMP_VECTORS[0];
                    _GeometryTools2.default.getEllipsePointWithRadian(x, y, radiusX, radiusY, theta, rotation, _nextPoint.value);
                    this.lineTo(_nextPoint.x, _nextPoint.y);
                }
            } else {
                for (var _theta = startAngle; _theta < endAngle; _theta += plusAngle) {
                    if (Math.abs(_theta - startAngle) >= _Tools2.default.PI2) {
                        return;
                    }
                    var _nextPoint2 = _Vector2.default.TEMP_VECTORS[0];
                    _GeometryTools2.default.getEllipsePointWithRadian(x, y, radiusX, radiusY, _theta, rotation, _nextPoint2.value);
                    this.lineTo(_nextPoint2.x, _nextPoint2.y);
                }
            }
            var nextPoint = _Vector2.default.TEMP_VECTORS[0];
            _GeometryTools2.default.getEllipsePointWithRadian(x, y, radiusX, radiusY, endAngle, rotation, nextPoint.value);
            this.lineTo(nextPoint.x, nextPoint.y);

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

        /**
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
            this[_stateArray].push(stateClone);
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
            m[14] = this.defaultDepth; //这个是默认的z值
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
            var n = _Mat2.default.multiplyWithVertex(m, FACE_NORMAL4);
            return n;
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