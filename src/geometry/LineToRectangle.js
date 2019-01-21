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

var LEFT_90_RADIAN = -Math.PI / 2;
var p1Temp = new _Vector2.default(0, 0, 0);
var p2Temp = new _Vector2.default(0, 0, 0);
var p3Temp = new _Vector2.default(0, 0, 0);
var p4Temp = new _Vector2.default(0, 0, 0);

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

var rayVectorTemp = new _Vector2.default(0, 0, 0);
var planeNormalTemp = new _Vector2.default();

var line1VectorTemp = new _Vector2.default(0, 0, 0);
var line2VectorTemp = new _Vector2.default(0, 0, 0);

// let rectPointsArray =[];
var startIndex = 0;
var endIndex = 0;

var LineToRectangle = function () {
    function LineToRectangle(lineWidth) {
        // this.dim = 3;
        // this.points = null;
        // this.isClosed = false;
        // this.lineWidth = lineWidth || 1;
        // this.faceDirection = Vector3.TEMP_VECTORS[3];
        // this.faceDirection.z = 1;

        _classCallCheck(this, LineToRectangle);
    }

    _createClass(LineToRectangle, null, [{
        key: "generatePoints1",
        value: function generatePoints1(lineWidth, points, isClosed, faceDirection) {
            if (lineWidth == undefined) lineWidth = 1;
            halfWidth[0] = lineWidth / 2;
            // rectPointsArray = [];
            endIndex = 0;
            if (points == null || points.length / 3 < 2) {
                return null;
            }
            faceDirectionTemp.x = faceDirection[0];
            faceDirectionTemp.y = faceDirection[1];
            faceDirectionTemp.z = faceDirection[2];
            var pointsCount = points.length / 3;
            var preRectLastPoints = { r1: null, r2: null, r3: null, r4: null };
            var rectPoints = [];
            var lineCount = pointsCount - 1;
            var that = this;
            //不确定设定的面朝向法向量是否是单位向量：
            _Vector2.default.normalize(faceDirectionTemp, faceDirectionTemp);
            if (isClosed) lineCount++;
            var dim = 3;
            for (var i = 0; i < lineCount; i++) {
                var index = i * dim;
                var x1 = points[index];
                var y1 = points[index + 1];
                p1Temp.x = x1;
                p1Temp.y = y1;
                p1Temp.z = points[index + 2];
                // let pv1 = {x: x1, y: y1, z: 0};
                // if (this.dim == 3) {
                //     pv1.z = this.points[index + 2];
                // }


                var nextIndex = (i + 1) * 3;
                if (nextIndex >= points.length) nextIndex = 0;
                var x2 = points[nextIndex];
                var y2 = points[nextIndex + 1];
                p2Temp.x = x2;
                p2Temp.y = y2;
                p2Temp.z = points[nextIndex + 2];
                // let pv2 = {x: x2, y: y2, z: 0};
                // if (this.dim == 3) {
                //     pv2.z = this.points[nextIndex + 2];
                // }
                line1VectorTemp.x = x2 - x1;
                line1VectorTemp.y = y2 - y1;
                line1VectorTemp.z = p2Temp.z - p1Temp.z;
                // let lv = {x: x2 - x1, y: y2 - y1, z: pv2.z - pv1.z};

                // let r1 = {x: 0, y: 0, z: 0};
                // let r2 = {x: 0, y: 0, z: 0};
                // let r3 = {x: 0, y: 0, z: 0};
                // let r4 = {x: 0, y: 0, z: 0};
                var temp = _Vector2.default.TEMP_VECTORS[0];
                _Vector2.default.cross(temp, line1VectorTemp, faceDirectionTemp);
                _Vector2.default.normalize(temp, temp);
                temp.x *= halfWidth[0];
                temp.y *= halfWidth[0];
                temp.z *= halfWidth[0];
                // Vector3.multiplyValue(temp, temp, halfWidth[0]);
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
                    this.updateConnectPoints(lastR1, lastR2, lastR3, lastR4, r1Temp, r2Temp, r3Temp, r4Temp, i, line1VectorTemp, faceDirectionTemp, rectPoints, lineWidth * 10);
                }

                //组织三角形
                this.addPoint(r1Temp, rectPoints);
                this.addPoint(r2Temp, rectPoints);
                this.addPoint(r3Temp, rectPoints);

                this.addPoint(r3Temp, rectPoints);
                this.addPoint(r4Temp, rectPoints);
                this.addPoint(r1Temp, rectPoints);

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

                // Vector3.copy(r1Temp, lastR1Temp);
                // Vector3.copy(r2Temp, lastR2Temp);
                // Vector3.copy(r3Temp, lastR3Temp);
                // Vector3.copy(r4Temp, lastR4Temp);

                preRectLastPoints.r1 = lastR1Temp;
                preRectLastPoints.r2 = lastR2Temp;
                preRectLastPoints.r3 = lastR3Temp;
                preRectLastPoints.r4 = lastR4Temp;
            }

            if (isClosed) {
                //开始和结尾的地方连接点要改一下
                var _endIndex = rectPoints.length / 3;
                var r1 = this.getPoint(0, rectPoints);
                _Vector2.default.copy(r1, r1Temp);
                var r2 = this.getPoint(1, rectPoints);
                _Vector2.default.copy(r2, r2Temp);
                var lr1 = this.getPoint(_endIndex - 1, rectPoints);
                _Vector2.default.copy(lr1, lastR1Temp);
                var lr2 = this.getPoint(_endIndex - 5, rectPoints);
                _Vector2.default.copy(lr2, lastR2Temp);

                var r4 = this.getPoint(4, rectPoints);
                _Vector2.default.copy(r4, r4Temp);
                var lr3 = this.getPoint(_endIndex - 3, rectPoints);
                _Vector2.default.copy(lr3, lastR3Temp);
                var lr4 = this.getPoint(_endIndex - 2, rectPoints);
                _Vector2.default.copy(lr4, lastR4Temp);

                // let temp = Vector3.TEMP_VECTORS[0];
                rayVectorTemp.x = lastR2Temp.x - lastR1Temp.x;
                rayVectorTemp.y = lastR2Temp.y - lastR1Temp.y;
                rayVectorTemp.z = lastR2Temp.z - lastR1Temp.z;
                var u1 = rayVectorTemp;
                _Vector2.default.normalize(u1, u1);
                var temp1 = _Vector2.default.TEMP_VECTORS[1];
                temp1.x = r1Temp.x - r2Temp.x;
                temp1.y = r1Temp.y - r2Temp.y;
                temp1.z = r1Temp.z - r2Temp.z;
                // TODO 如果平行，要跟之前连接点处理一致才行
                var n = planeNormalTemp;
                _Vector2.default.cross(n, temp1, faceDirectionTemp);
                _Vector2.default.normalize(n, n);
                var _temp = _Vector2.default.TEMP_VECTORS[0];
                var p1 = _GeometryTools2.default.calculateIntersectionOfPlane(n, u1, lastR2Temp, r2Temp, _temp);
                if (_temp != undefined) {
                    this.setPointValue(_temp.x, _temp.y, _temp.z, 0, rectPoints);
                    this.setPointValue(_temp.x, _temp.y, _temp.z, 5, rectPoints);
                    this.setPointValue(_temp.x, _temp.y, _temp.z, _endIndex - 5, rectPoints);
                }
                u1.x = lastR3Temp.x - lastR4Temp.x;
                u1.y = lastR3Temp.y - lastR4Temp.y;
                u1.z = lastR3Temp.z - lastR4Temp.z;
                _Vector2.default.normalize(u1, u1);

                var p2 = _GeometryTools2.default.calculateIntersectionOfPlane(n, u1, lastR3Temp, r4Temp, _temp);
                if (_temp != undefined) {
                    this.setPointValue(_temp.x, _temp.y, _temp.z, 4, rectPoints);
                    this.setPointValue(_temp.x, _temp.y, _temp.z, _endIndex - 3, rectPoints);
                    this.setPointValue(_temp.x, _temp.y, _temp.z, _endIndex - 4, rectPoints);
                }
            }
            return rectPoints;
            // return {rects: rectPoints, end: rectPoints.length};
        }
    }, {
        key: "setPointValue",
        value: function setPointValue(x, y, z, index, rectPoints) {
            index = index * 3;
            rectPoints[index] = x;
            rectPoints[index + 1] = y;
            rectPoints[index + 2] = z;
        }
    }, {
        key: "getPoint",
        value: function getPoint(index, rectPoints) {
            index = index * 3;
            var temp = _Vector2.default.TEMP_VECTORS[0];
            temp.x = rectPoints[index];
            temp.y = rectPoints[index + 1];
            temp.z = rectPoints[index + 2];
            return temp;
        }
    }, {
        key: "updateRectPoint",
        value: function updateRectPoint(p, p1, index, rectPoints) {
            index = index * 18;
            var r2Index = index + 3;
            var r3Index = r2Index + 3;
            if (p != null) {
                rectPoints[r2Index] = p.x;
                rectPoints[r2Index + 1] = p.y;
                rectPoints[r2Index + 2] = p.z;
            }
            if (p1 != null) {
                rectPoints[r3Index] = p1.x;
                rectPoints[r3Index + 1] = p1.y;
                rectPoints[r3Index + 2] = p1.z;
                r3Index += 3;
                rectPoints[r3Index] = p1.x;
                rectPoints[r3Index + 1] = p1.y;
                rectPoints[r3Index + 2] = p1.z;
            }
        }
    }, {
        key: "updateConnectPoints",
        value: function updateConnectPoints(lastR1, lastR2, lastR3, lastR4, r1, r2, r3, r4, lineIndex, lineDirection, faceDirection, rectPoints, maxLength) {
            var temp = _Vector2.default.TEMP_VECTORS[0];
            var u1 = rayVectorTemp;
            u1.x = lastR2.x - lastR1.x;
            u1.y = lastR2.y - lastR1.y;
            u1.z = lastR2.z - lastR1.z;
            _Vector2.default.normalize(u1, u1);
            _Vector2.default.normalize(lineDirection, lineDirection);
            var dotValue = _Vector2.default.dot(lineDirection, u1);

            /*
             * TODO 逆向的情况暂不做处理，因为会产生一个bug，如下描述：
             * 当逆向的时候，如果接近平行，交点会在很远的地方，这样形成的三角形就会很怪异
             * TODO 逆向平行：未做处理
             * TODO 如果逆向求交点，当两条线特别接近平行的时候，交点会在很远很远的地方，绘制的时候就会出现一条很长的射线，这个需要处理
             */
            if (dotValue < 0) return;
            dotValue = Math.abs(dotValue);
            /*
             @TODO 目前如果平行就跳过
             *@TODO 这里要计算一下如果两条线平行的情况该如何处理,目前只是简单的跳过这种情况，不做线的交点计算
             *@TODO 同向平行：前一个线段的矩形的p2和p3改成当前线的p2,p3,当前线段不建立矩形。
             */
            if (_Tools2.default.equals(dotValue, 1)) {
                return;
            }
            var n = planeNormalTemp;
            _Vector2.default.cross(n, lineDirection, faceDirection);
            _Vector2.default.normalize(n, n);
            _GeometryTools2.default.calculateIntersectionOfPlane(n, u1, lastR2, r1, line2VectorTemp);
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
            _GeometryTools2.default.calculateIntersectionOfPlane(n, u1, lastR4, r4, temp);
            if (temp != null) {
                //更新上个矩形r3和这个矩形的r4
                r4.x = temp.x;
                r4.y = temp.y;
                r4.z = temp.z;
            }
            this.updateRectPoint(line2VectorTemp, temp, lineIndex - 1, rectPoints);
        }
    }, {
        key: "addPoint",
        value: function addPoint(point, rectPoints) {
            // rectPoints.push(point.x);
            // rectPoints.push(point.y);
            // rectPoints.push(point.z);
            // if (endIndex + 1 >= rectPoints.length) {
            rectPoints.push(point.x);
            rectPoints.push(point.y);
            rectPoints.push(point.z);
            // } else {
            //     rectPoints[endIndex] = point.x;
            //     rectPoints[endIndex + 1] = point.y;
            //     rectPoints[endIndex + 2] = point.z;
            // }
            // endIndex += 3;
            // rectPoints.push(point.x);
            // rectPoints.push(point.y);
            // rectPoints.push(point.z);
        }
    }]);

    return LineToRectangle;
}();

exports.default = LineToRectangle;