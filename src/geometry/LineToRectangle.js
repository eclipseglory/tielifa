"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Vector = require("../math/Vector3.js");

var _Vector2 = _interopRequireDefault(_Vector);

var _GeometryTools = require("./GeometryTools.js");

var _GeometryTools2 = _interopRequireDefault(_GeometryTools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LEFT_90_RADIAN = -Math.PI / 2;

var LineToRectangle = function () {
    function LineToRectangle(lineWidth) {
        _classCallCheck(this, LineToRectangle);

        this.dim = 3;
        this.points = null;
        this.isClosed = false;
        this.lineWidth = lineWidth || 1;
        this.faceDirection = _Vector2.default.TEMP_VECTORS[3];
        this.faceDirection.z = 1;
    }

    _createClass(LineToRectangle, [{
        key: "generatePoints",
        value: function generatePoints() {
            if (this.points == null || this.points.length / this.dim < 2) return [];
            var pointsCount = this.points.length / this.dim;
            var preRectLastPoints = { r1: null, r2: null, r3: null, r4: null };
            var rectPoints = [];
            var lineCount = pointsCount - 1;
            var that = this;
            //不确定设定的面朝向法向量是否是单位向量：
            _Vector2.default.normalize(this.faceDirection, this.faceDirection);
            if (this.isClosed) lineCount++;
            for (var i = 0; i < lineCount; i++) {
                var index = i * this.dim;
                var x1 = this.points[index];
                var y1 = this.points[index + 1];
                var pv1 = { x: x1, y: y1, z: 0 };
                if (this.dim == 3) {
                    pv1.z = this.points[index + 2];
                }

                var nextIndex = (i + 1) * this.dim;
                if (nextIndex >= this.points.length) nextIndex = 0;
                var x2 = this.points[nextIndex];
                var y2 = this.points[nextIndex + 1];
                var pv2 = { x: x2, y: y2, z: 0 };
                if (this.dim == 3) {
                    pv2.z = this.points[nextIndex + 2];
                }

                var lv = { x: x2 - x1, y: y2 - y1, z: pv2.z - pv1.z };

                var r1 = { x: 0, y: 0, z: 0 };
                var r2 = { x: 0, y: 0, z: 0 };
                var r3 = { x: 0, y: 0, z: 0 };
                var r4 = { x: 0, y: 0, z: 0 };
                var temp = _Vector2.default.TEMP_VECTORS[0];
                _Vector2.default.cross(temp, lv, this.faceDirection);
                _Vector2.default.normalize(temp, temp);
                _Vector2.default.multiplyValue(temp, temp, this.lineWidth / 2);
                _Vector2.default.plus(r1, temp, pv1);
                _Vector2.default.plus(r2, temp, pv2);
                // 反向
                temp.x = -temp.x;
                temp.y = -temp.y;
                temp.z = -temp.z;
                _Vector2.default.plus(r3, temp, pv2);
                _Vector2.default.plus(r4, temp, pv1);

                var lastR1 = preRectLastPoints.r1;
                var lastR4 = preRectLastPoints.r4;
                var lastR2 = preRectLastPoints.r2;
                var lastR3 = preRectLastPoints.r3;
                if (lastR1 != null) {
                    updateConnectPoints(lastR1, lastR2, lastR3, lastR4, r1, r2, r3, r4, i, lv);
                }

                //组织三角形
                addPoint(r1);
                addPoint(r2);
                addPoint(r3);

                addPoint(r3);
                addPoint(r4);
                addPoint(r1);

                preRectLastPoints.r1 = r1;
                preRectLastPoints.r2 = r2;
                preRectLastPoints.r3 = r3;
                preRectLastPoints.r4 = r4;
            }

            if (this.isClosed) {
                //开始和结尾的地方连接点要改一下
                var endIndex = rectPoints.length / this.dim;
                var _r = getPoint(0);
                var _r2 = getPoint(1);
                var lr1 = getPoint(endIndex - 1);
                var lr2 = getPoint(endIndex - 5);

                var _r3 = getPoint(4);
                var lr3 = getPoint(endIndex - 3);
                var lr4 = getPoint(endIndex - 2);

                var _temp = _Vector2.default.TEMP_VECTORS[0];
                _temp.x = lr2.x - lr1.x;
                _temp.y = lr2.y - lr1.y;
                _temp.z = lr2.z - lr1.z;
                var u1 = { x: 0, y: 0, z: 0 };
                _Vector2.default.normalize(u1, _temp);
                var temp1 = _Vector2.default.TEMP_VECTORS[1];
                temp1.x = _r.x - _r2.x;
                temp1.y = _r.y - _r2.y;
                temp1.z = _r.z - _r2.z;
                var n = { x: 0, y: 0, z: 0 };
                _Vector2.default.cross(_temp, temp1, that.faceDirection);
                _Vector2.default.normalize(n, _temp);
                var p1 = _GeometryTools2.default.calculateIntersectionOfPlane(n, u1, lr2, _r2);
                if (p1 != undefined) {
                    setPointValue(p1.x, p1.y, p1.z, 0);
                    setPointValue(p1.x, p1.y, p1.z, 5);
                    setPointValue(p1.x, p1.y, p1.z, endIndex - 5);
                }
                _temp.x = lr3.x - lr4.x;
                _temp.y = lr3.y - lr4.y;
                _temp.z = lr3.z - lr4.z;
                _Vector2.default.normalize(u1, _temp);

                var p2 = _GeometryTools2.default.calculateIntersectionOfPlane(n, u1, lr3, _r3);
                if (p2 != undefined) {
                    setPointValue(p2.x, p2.y, p2.z, 4);
                    setPointValue(p2.x, p2.y, p2.z, endIndex - 3);
                    setPointValue(p2.x, p2.y, p2.z, endIndex - 4);
                }
            }

            function updateConnectPoints(lastR1, lastR2, lastR3, lastR4, r1, r2, r3, r4, lineIndex, lineDirection) {
                var temp = _Vector2.default.TEMP_VECTORS[0];
                temp.x = lastR2.x - lastR1.x;
                temp.y = lastR2.y - lastR1.y;
                temp.z = lastR2.z - lastR1.z;
                var u1 = { x: 0, y: 0, z: 0 };
                _Vector2.default.normalize(u1, temp);
                var n = { x: 0, y: 0, z: 0 };
                _Vector2.default.cross(temp, lineDirection, that.faceDirection);
                _Vector2.default.normalize(n, temp);
                var p1 = _GeometryTools2.default.calculateIntersectionOfPlane(n, u1, lastR2, r2);
                if (p1 != null) {
                    //更新上个矩形r2和这个矩形的r1
                    r1.x = p1.x;
                    r1.y = p1.y;
                    r1.z = p1.z;
                }
                temp.x = lastR3.x - lastR4.x;
                temp.y = lastR3.y - lastR4.y;
                temp.z = lastR3.z - lastR4.z;
                _Vector2.default.normalize(u1, temp);
                var p2 = _GeometryTools2.default.calculateIntersectionOfPlane(n, u1, lastR3, r4);
                if (p2 != null) {
                    //更新上个矩形r3和这个矩形的r4
                    r4.x = p2.x;
                    r4.y = p2.y;
                    r4.z = p2.z;
                }
                updateRectPoint(p1, p2, lineIndex - 1);
            }

            function updateRectPoint(p, p1, index) {
                index = index * 6 * that.dim;
                var r2Index = index + that.dim;
                var r3Index = r2Index + that.dim;
                if (p != null) {
                    rectPoints[r2Index] = p.x;
                    rectPoints[r2Index + 1] = p.y;
                    rectPoints[r2Index + 2] = p.z;
                }
                if (p1 != null) {
                    rectPoints[r3Index] = p1.x;
                    rectPoints[r3Index + 1] = p1.y;
                    rectPoints[r3Index + 2] = p1.z;
                    r3Index += that.dim;
                    rectPoints[r3Index] = p1.x;
                    rectPoints[r3Index + 1] = p1.y;
                    rectPoints[r3Index + 2] = p1.z;
                }
            }

            function addPoint(point) {

                rectPoints.push(point.x);
                rectPoints.push(point.y);
                if (that.dim == 3) rectPoints.push(point.z);
            }

            function setPointValue(x, y, z, index) {
                index = index * that.dim;
                rectPoints[index] = x;
                rectPoints[index + 1] = y;
                if (that.dim == 3 && z != undefined) {
                    rectPoints[index + 2] = z;
                }
            }

            function getPoint(index) {
                index = index * that.dim;
                if (that.dim == 2) {
                    return { x: rectPoints[index], y: rectPoints[index + 1] };
                }
                if (that.dim == 3) {
                    return { x: rectPoints[index], y: rectPoints[index + 1], z: rectPoints[index + 2] };
                }
            }

            return rectPoints;
        }
    }]);

    return LineToRectangle;
}();

exports.default = LineToRectangle;