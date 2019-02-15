"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Vector = require("../math/Vector3.js");

var _Vector2 = _interopRequireDefault(_Vector);

var _GeometryTools = require("./GeometryTools.js");

var _GeometryTools2 = _interopRequireDefault(_GeometryTools);

var _Tools = require("../utils/Tools.js");

var _Tools2 = _interopRequireDefault(_Tools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var p1Temp = new _Vector2.default(0, 0, 0);
var p2Temp = new _Vector2.default(0, 0, 0);

var halfWidth = new Float32Array(1);

var faceDirectionTemp = new _Vector2.default();

var lastR1Temp = new _Vector2.default(0, 0, 0);
var lastR2Temp = new _Vector2.default(0, 0, 0);
var lastR3Temp = new _Vector2.default(0, 0, 0);
var lastR4Temp = new _Vector2.default(0, 0, 0);

var r1Temp = new _Vector2.default(0, 0, 0);
var r2Temp = new _Vector2.default(0, 0, 0);
var r3Temp = new _Vector2.default(0, 0, 0);
var r4Temp = new _Vector2.default(0, 0, 0);

var firstPoint1 = new _Vector2.default(0, 0, 0);
var firstPoint2 = new _Vector2.default(0, 0, 0);
var firstPoint3 = new _Vector2.default(0, 0, 0);
var firstPoint4 = new _Vector2.default(0, 0, 0);

var lastPoint1 = new _Vector2.default(0, 0, 0);
var lastPoint2 = new _Vector2.default(0, 0, 0);
var lastPoint3 = new _Vector2.default(0, 0, 0);
var lastPoint4 = new _Vector2.default(0, 0, 0);

var rayVectorTemp = new _Vector2.default(0, 0, 0);
var planeNormalTemp = new _Vector2.default();

var line1VectorTemp = new _Vector2.default(0, 0, 0);
var line2VectorTemp = new _Vector2.default(0, 0, 0);

var endIndex = 0;

var LineToRectangle = function () {
    function LineToRectangle(lineWidth) {
        _classCallCheck(this, LineToRectangle);
    }

    _createClass(LineToRectangle, null, [{
        key: "generateRectanglesPoints",
        value: function generateRectanglesPoints(lineWidth, isClosed, faceDirection, outputInterface, inputInterface) {
            if (lineWidth == undefined) lineWidth = 1;
            outputInterface = outputInterface || {};
            var setPoint = outputInterface.setPoint;
            var addPoint = outputInterface.addPoint;
            var rectPoints = [];
            if (setPoint == undefined) {
                setPoint = function setPoint(point, index) {
                    index = index * 3;
                    rectPoints[index] = point.x;
                    rectPoints[index + 1] = point.y;
                    rectPoints[index + 2] = point.z;
                };
            }
            if (addPoint == undefined) {
                addPoint = function addPoint(point) {
                    rectPoints.push(point.x);
                    rectPoints.push(point.y);
                    rectPoints.push(point.z);
                };
            }

            halfWidth[0] = lineWidth / 2;
            endIndex = 0;
            if (inputInterface == null || inputInterface.getPointsNum() < 2) {
                return 0;
            }
            // if (points == null || points.length / 3 < 2) {
            //     return null;
            // }
            faceDirectionTemp.x = faceDirection[0];
            faceDirectionTemp.y = faceDirection[1];
            faceDirectionTemp.z = faceDirection[2];
            // let pointsCount = points.length / 3;
            var pointsCount = inputInterface.getPointsNum();
            var preRectLastPoints = { r1: null, r2: null, r3: null, r4: null };
            var lineCount = pointsCount - 1;
            var that = this;
            //不确定设定的面朝向法向量是否是单位向量：
            _Vector2.default.normalize(faceDirectionTemp, faceDirectionTemp);
            if (isClosed) lineCount++;
            var dim = 3;
            for (var i = 0; i < lineCount; i++) {
                // let index = i * dim;
                // let x1 = points[index];
                // let y1 = points[index + 1];
                // p1Temp.x = x1;
                // p1Temp.y = y1;
                // p1Temp.z = points[index + 2];
                // p1Temp.z = inputInterface.getZ(i);

                p1Temp.x = inputInterface.getX(i);
                p1Temp.y = inputInterface.getY(i);
                p1Temp.z = inputInterface.getZ(i);

                // let nextIndex = ((i + 1) * 3);
                // if (nextIndex >= points.length) nextIndex = 0;
                var nextPointIndex = i + 1;
                if (nextPointIndex >= pointsCount) nextPointIndex = 0;
                // let x2 = points[nextIndex];
                // let y2 = points[nextIndex + 1];
                // x2 = inputInterface.getX(nextPointIndex);
                // y2 = inputInterface.getY(nextPointIndex);
                // p2Temp.x = x2;
                // p2Temp.y = y2;
                // p2Temp.z = points[nextIndex + 2];
                // p2Temp.z = inputInterface.getZ(nextPointIndex);

                p2Temp.x = inputInterface.getX(nextPointIndex);
                p2Temp.y = inputInterface.getY(nextPointIndex);
                p2Temp.z = inputInterface.getZ(nextPointIndex);

                line1VectorTemp.x = p2Temp.x - p1Temp.x;
                line1VectorTemp.y = p2Temp.y - p1Temp.y;
                line1VectorTemp.z = p2Temp.z - p1Temp.z;
                var temp = _Vector2.default.TEMP_VECTORS[0];
                _Vector2.default.cross(temp, line1VectorTemp, faceDirectionTemp);
                _Vector2.default.normalize(temp, temp);
                temp.x *= halfWidth[0];
                temp.y *= halfWidth[0];
                temp.z *= halfWidth[0];
                _Vector2.default.plus(r1Temp, temp, p1Temp);
                _Vector2.default.plus(r2Temp, temp, p2Temp);
                // 反向
                temp.x = -temp.x;
                temp.y = -temp.y;
                temp.z = -temp.z;
                _Vector2.default.plus(r3Temp, temp, p2Temp);
                _Vector2.default.plus(r4Temp, temp, p1Temp);

                var lastR1 = preRectLastPoints.r1;
                var lastR4 = preRectLastPoints.r4;
                var lastR2 = preRectLastPoints.r2;
                var lastR3 = preRectLastPoints.r3;
                if (lastR1 != null) {
                    this.updateConnectPoints(lastR1, lastR2, lastR3, lastR4, r1Temp, r2Temp, r3Temp, r4Temp, i, line1VectorTemp, faceDirectionTemp, rectPoints, setPoint);
                }

                //组织三角形
                addPoint(r1Temp, i, 0);
                addPoint(r2Temp, i, 1);
                addPoint(r3Temp, i, 2);
                addPoint(r4Temp, i, 3);

                lastR1Temp.value[0] = r1Temp.value[0];
                lastR1Temp.value[1] = r1Temp.value[1];
                lastR1Temp.value[2] = r1Temp.value[2];

                lastR2Temp.value[0] = r2Temp.value[0];
                lastR2Temp.value[1] = r2Temp.value[1];
                lastR2Temp.value[2] = r2Temp.value[2];

                lastR3Temp.value[0] = r3Temp.value[0];
                lastR3Temp.value[1] = r3Temp.value[1];
                lastR3Temp.value[2] = r3Temp.value[2];

                lastR4Temp.value[0] = r4Temp.value[0];
                lastR4Temp.value[1] = r4Temp.value[1];
                lastR4Temp.value[2] = r4Temp.value[2];
                if (i == 0) {
                    firstPoint1.value[0] = r1Temp.value[0];
                    firstPoint1.value[1] = r1Temp.value[1];
                    firstPoint1.value[2] = r1Temp.value[2];

                    firstPoint2.value[0] = r2Temp.value[0];
                    firstPoint2.value[1] = r2Temp.value[1];
                    firstPoint2.value[2] = r2Temp.value[2];

                    firstPoint3.value[0] = r3Temp.value[0];
                    firstPoint3.value[1] = r3Temp.value[1];
                    firstPoint3.value[2] = r3Temp.value[2];

                    firstPoint4.value[0] = r4Temp.value[0];
                    firstPoint4.value[1] = r4Temp.value[1];
                    firstPoint4.value[2] = r4Temp.value[2];
                }
                if (i + 1 == lineCount) {
                    lastPoint1.value[0] = r1Temp.value[0];
                    lastPoint1.value[1] = r1Temp.value[1];
                    lastPoint1.value[2] = r1Temp.value[2];

                    lastPoint2.value[0] = r2Temp.value[0];
                    lastPoint2.value[1] = r2Temp.value[1];
                    lastPoint2.value[2] = r2Temp.value[2];

                    lastPoint3.value[0] = r3Temp.value[0];
                    lastPoint3.value[1] = r3Temp.value[1];
                    lastPoint3.value[2] = r3Temp.value[2];

                    lastPoint4.value[0] = r4Temp.value[0];
                    lastPoint4.value[1] = r4Temp.value[1];
                    lastPoint4.value[2] = r4Temp.value[2];
                }

                preRectLastPoints.r1 = lastR1Temp;
                preRectLastPoints.r2 = lastR2Temp;
                preRectLastPoints.r3 = lastR3Temp;
                preRectLastPoints.r4 = lastR4Temp;
            }

            if (isClosed) {
                //开始和结尾的地方连接点要改一下
                var _endIndex = lineCount * 4; //rectPoints.length / 3;
                rayVectorTemp.x = lastPoint2.x - lastPoint1.x;
                rayVectorTemp.y = lastPoint2.y - lastPoint1.y;
                rayVectorTemp.z = lastPoint2.z - lastPoint1.z;
                var u1 = rayVectorTemp;
                _Vector2.default.normalize(u1, u1);
                var temp1 = _Vector2.default.TEMP_VECTORS[1];
                temp1.x = firstPoint1.x - firstPoint2.x;
                temp1.y = firstPoint1.y - firstPoint2.y;
                temp1.z = firstPoint1.z - firstPoint2.z;
                // TODO 如果平行，要跟之前连接点处理一致才行
                var n = planeNormalTemp;
                _Vector2.default.cross(n, temp1, faceDirectionTemp);
                _Vector2.default.normalize(n, n);
                var _temp = _Vector2.default.TEMP_VECTORS[0];
                _GeometryTools2.default.calculateIntersectionOfPlane(n, u1, lastPoint2, firstPoint2, _temp);
                if (_temp != undefined) {
                    setPoint(_temp, 0);
                    setPoint(_temp, _endIndex - 3);
                }
                u1.x = lastPoint3.x - lastPoint4.x;
                u1.y = lastPoint3.y - lastPoint4.y;
                u1.z = lastPoint3.z - lastPoint4.z;
                _Vector2.default.normalize(u1, u1);

                _GeometryTools2.default.calculateIntersectionOfPlane(n, u1, lastPoint3, firstPoint4, _temp);
                if (_temp != undefined) {
                    setPoint(_temp, 3);
                    setPoint(_temp, _endIndex - 2);
                }
            }
            if (rectPoints.length == 0) {
                return lineCount;
            }
            return rectPoints;
            // return {rects: rectPoints, end: rectPoints.length};
        }

        /**@deprecated*/

    }, {
        key: "setPointValue",
        value: function setPointValue(x, y, z, index, rectPoints) {
            index = index * 3;
            rectPoints[index] = x;
            rectPoints[index + 1] = y;
            rectPoints[index + 2] = z;
        }
    }, {
        key: "updateRectPoint",
        value: function updateRectPoint(p, p1, lineIndex, rectPoints, setPoint) {
            lineIndex = lineIndex * 4;
            var r2Index = lineIndex + 1;
            var r3Index = r2Index + 1;
            if (p != null) {
                setPoint(p, r2Index);
            }
            if (p1 != null) {
                setPoint(p1, r3Index);
            }
        }
    }, {
        key: "updateConnectPoints",
        value: function updateConnectPoints(lastR1, lastR2, lastR3, lastR4, r1, r2, r3, r4, lineIndex, lineDirection, faceDirection, rectPoints, setPoint) {
            var maxLength = _Tools2.default.getDistance(lastR2, r1) * 2;
            var temp = _Vector2.default.TEMP_VECTORS[0];
            var u1 = rayVectorTemp;
            u1.x = lastR2.x - lastR1.x;
            u1.y = lastR2.y - lastR1.y;
            u1.z = lastR2.z - lastR1.z;
            _Vector2.default.normalize(u1, u1);
            // Vector3.normalize(lineDirection, lineDirection);
            var n = planeNormalTemp;
            _Vector2.default.cross(n, lineDirection, faceDirection);
            _Vector2.default.normalize(n, n);

            /*
            * 几乎平行：无法做交点计算，当前线段的矩形的p1和p4改成前一条线的p2,p3
            */
            // let down = Vector3.dot(n, u1);
            // if (Math.abs(down) < Tools.EPSILON) {
            //     r1.x = lastR2.x;
            //     r1.y = lastR2.y;
            //     r1.z = lastR2.z;
            //     r4.x = lastR3.x;
            //     r4.y = lastR3.y;
            //     r4.z = lastR3.z;
            //     return;
            // }
            /*
             * 这里计算出没有交点时两条线端点距离，作为最大的距离（计算交点时候的向量所放量）
             * 如果距离过大则需要计算，因为有时候两条线趋于平行，会造成计算出的交点特别远，这就让整个图形看上去是错误的
             */
            _GeometryTools2.default.calculateIntersectionOfPlane(n, u1, lastR2, r1, line2VectorTemp, maxLength);
            // 此时说明两条线几乎平行无法计算出交点.当前线段的矩形的p1和p4改成前一条线的p2,p3
            if (line2VectorTemp == null) {
                r1.x = lastR2.x;
                r1.y = lastR2.y;
                r1.z = lastR2.z;
                r4.x = lastR3.x;
                r4.y = lastR3.y;
                r4.z = lastR3.z;
                return;
            }

            if (line2VectorTemp != null) {
                //更新上个矩形r2和这个矩形的r1
                r1.x = line2VectorTemp.x;
                r1.y = line2VectorTemp.y;
                r1.z = line2VectorTemp.z;
            }
            u1.x = lastR3.x - lastR4.x;
            u1.y = lastR3.y - lastR4.y;
            u1.z = lastR3.z - lastR4.z;
            _Vector2.default.normalize(u1, u1);
            _GeometryTools2.default.calculateIntersectionOfPlane(n, u1, lastR3, r4, temp, maxLength);
            if (temp != null) {
                //更新上个矩形r3和这个矩形的r4
                r4.x = temp.x;
                r4.y = temp.y;
                r4.z = temp.z;
            }
            this.updateRectPoint(line2VectorTemp, temp, lineIndex - 1, rectPoints, setPoint);
        }

        /**@deprecated*/

    }, {
        key: "addPoint",
        value: function addPoint(point, rectPoints) {
            rectPoints.push(point.x);
            rectPoints.push(point.y);
            rectPoints.push(point.z);
        }
    }]);

    return LineToRectangle;
}();

exports.default = LineToRectangle;