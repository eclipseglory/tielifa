"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Vector = require("../math/Vector3.js");

var _Vector2 = _interopRequireDefault(_Vector);

var _Mat = require("../math/Mat3.js");

var _Mat2 = _interopRequireDefault(_Mat);

var _Vector3 = require("../math/Vector2.js");

var _Vector4 = _interopRequireDefault(_Vector3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GeometryTools = function () {
    function GeometryTools() {
        _classCallCheck(this, GeometryTools);
    }

    _createClass(GeometryTools, null, [{
        key: "cubicBezier",
        value: function cubicBezier(t, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, out) {
            // b(t) = (1-t)^3p0 + 3(1-t)^2tp1+3(1-t)t^2p2+t^3p3
            out = out || [0, 0];
            var t1 = 1 - t;
            var x = t1 * t1 * t1 * p0x;
            x += 3 * t1 * t1 * t * p1x;
            x += 3 * t1 * t * t * p2x;
            x += t * t * t * p3x;

            var y = t1 * t1 * t1 * p0y;
            y += 3 * t1 * t1 * t * p1y;
            y += 3 * t1 * t * t * p2y;
            y += t * t * t * p3y;
            out[0] = x;
            out[1] = y;
            return out;
        }
    }, {
        key: "quadraticBezier",
        value: function quadraticBezier(t, p0x, p0y, p1x, p1y, p2x, p2y, out) {
            // b(t) = (1-t)^2p0 + 2(1-t)tp1+t^2p2
            out = out || [0, 0];
            var t1 = 1 - t;
            var x = t1 * t1 * p0x;
            x += 2 * t1 * t * p1x;
            x += t * t * p2x;
            out[0] = x;

            var y = t1 * t1 * p0y;
            y += 2 * t1 * t * p1y;
            y += t * t * p2y;
            out[1] = y;

            return out;
        }

        /**
         * 计算过椭圆上某两点的椭圆圆心以及两点对应的角度
         * 计算圆心和夹角方法和公式：https://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
         * @param x1 椭圆上某点1 x
         * @param y1 椭圆上某点1 y
         * @param x2 椭圆上某点2 x
         * @param y2 椭圆上某点2 y
         * @param radiusX 椭圆横向半径
         * @param radiusY 椭圆纵向半径
         * @param rotation 椭圆旋转弧度
         * @returns {{x: number, y: number, theta: number, deltaTheta: number}}
         */

    }, {
        key: "arcConversionEndpointToCenter",
        value: function arcConversionEndpointToCenter(x1, y1, x2, y2, radiusX, radiusY, rotation) {
            var fa = 0;
            var fs = 1;
            var v = [(x1 - x2) / 2, (y1 - y2) / 2, 0];
            var m = _Mat2.default.TEMP_MAT3[0];
            if (rotation != 0) {
                _Mat2.default.rotate(m, -rotation);
                _Mat2.default.multiplyWithVertex(m, m, v);
                v[0] = m[0];
                v[1] = m[1];
            }

            var scaleUp = radiusX * radiusX * radiusY * radiusY / (radiusX * radiusX * v[1] * v[1] + radiusY * radiusY * v[0] * v[0]);
            scaleUp = Math.abs(scaleUp - 1);
            if (scaleUp < 0) throw new Error('radius is small, the ellipse does not across these two points');
            var scale = Math.sqrt(scaleUp);
            var sign = 1;
            if (fa == fs) sign = -1;
            scale *= sign;
            var v1 = [radiusX * v[1] / radiusY, -radiusY * v[0] / radiusX, 0];
            v1[0] *= scale;
            v1[1] *= scale;
            var c = [v1[0], v1[1], 0];
            if (rotation != 0) {
                _Mat2.default.rotate(m, rotation);
                _Mat2.default.multiplyWithVertex(m, m, c);
            }
            var cx = c[0] + (x1 + x2) / 2;
            var cy = c[1] + (y1 + y2) / 2;

            var u = _Vector4.default.TEMP_VECTORS[0];
            u.x = 1;
            u.y = 0;
            var u1 = _Vector4.default.TEMP_VECTORS[1];
            u1.x = (v[0] - v1[0]) / radiusX;
            u1.y = (v[1] - v1[1]) / radiusY;

            var theta = Math.abs(Math.acos(_Vector4.default.dot(u, u1) / (u.magnitude * u1.magnitude)));
            if (u.x * u1.y < 0) {
                theta *= -1;
            }
            u.x = (-v[0] - v1[0]) / radiusX;
            u.y = (-v[1] - v1[1]) / radiusY;
            var deltaTheta = Math.acos(_Vector4.default.dot(u, u1) / (u.magnitude * u1.magnitude));
            deltaTheta = Math.abs(deltaTheta % (Math.PI * 2));
            if (fs == 0) deltaTheta *= -1;
            return { x: cx, y: cy, theta: theta, deltaTheta: deltaTheta };
        }

        /**
         * 计算平面椭圆上某弧度对应的坐标点
         * @param x
         * @param y
         * @param radiusX
         * @param radiusY
         * @param radian
         * @param rotation
         * @param output
         * @returns {*}
         */

    }, {
        key: "getEllipsePointWithRadian",
        value: function getEllipsePointWithRadian(x, y, radiusX, radiusY, radian, rotation, output) {
            output = output || [0, 0];
            var v = _Vector2.default.TEMP_VECTORS[0];
            v.x = radiusX * Math.cos(radian);
            v.y = radiusY * Math.sin(radian);
            v.z = 0;
            if (rotation != 0) {
                var m = _Mat2.default.TEMP_MAT3[0];
                _Mat2.default.rotate(m, rotation);
                _Mat2.default.multiplyWithVertex(m, m, v.value);
                v.x = m[0];
                v.y = m[1];
            }
            output[0] = v.x + x;
            output[1] = v.y + y;
            return output;
        }

        /**
         * 计算空间中线到面的交点
         * 计算方法来自：http://geomalgorithms.com/a05-_intersect-1.html
         * @param n 面的法向量（单位向量）
         * @param u 线的向量 （单位向量）
         * @param p 线上某点
         * @param v 面上某点
         * @returns {*}
         */

    }, {
        key: "calculateIntersectionOfPlane",
        value: function calculateIntersectionOfPlane(n, u, p, v) {
            var down = _Vector2.default.dot(n, u);
            if (down == 0) return null;
            var w = { x: v.x - p.x, y: v.y - p.y, z: v.z - p.z };
            var length = _Vector2.default.dot(w, n) / down;
            var result = { x: 0, y: 0, z: 0 };
            _Vector2.default.multiplyValue(result, u, length);
            _Vector2.default.plus(result, result, p);
            return result;
        }

        /**
         * 计算平面上两条线的交点
         * @param p1
         * @param p2
         * @param p3
         * @param p4
         * @returns {*}
         */

    }, {
        key: "calculateIntersectionOfTowLines",
        value: function calculateIntersectionOfTowLines(p1, p2, p3, p4) {
            var x1 = p1.x;
            var y1 = p1.y;

            var x2 = p2.x;
            var y2 = p2.y;

            var x3 = p3.x;
            var y3 = p3.y;

            var x4 = p4.x;
            var y4 = p4.y;

            var share = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
            if (share == 0) return undefined;
            var px = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
            px = px / share;

            var py = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
            py = py / share;

            return { x: px, y: py };
        }
    }]);

    return GeometryTools;
}();

exports.default = GeometryTools;