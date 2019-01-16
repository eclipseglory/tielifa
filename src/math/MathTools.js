'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Vector = require('./Vector3.js');

var _Vector2 = _interopRequireDefault(_Vector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MathTools = function () {
    function MathTools() {
        _classCallCheck(this, MathTools);
    }

    /**
     * 计算方法来自：http://geomalgorithms.com/a05-_intersect-1.html
     * @param n 面的法向量（单位向量）
     * @param u 线的向量 （单位向量）
     * @param p 线上某点
     * @param v 面上某点
     * @returns {*}
     */


    _createClass(MathTools, null, [{
        key: 'calculateIntersectionOfPlane',
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
    }, {
        key: 'calculateIntersectionOfTowLines',
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
    }, {
        key: 'calculateLineFunctionConstant',
        value: function calculateLineFunctionConstant(point1, point2) {
            var deltaX = point1.x - point2.x;
            var deltaY = point1.y - point2.y;

            var x1 = point1.x;
            var y1 = point1.y;
            var x2 = point2.x;
            var y2 = point2.y;

            // if (deltaY < 0) {
            //     let x = x1;
            //     x1 = x2;
            //     x2 = x;
            //     let y = y1;
            //     y1 = y2;
            //     y2 = y;
            // }
            // 根据直线方程 kx+b=y 计算 k和b的值
            var b = 0;
            var k = 0;
            if (deltaX == 0) {
                return { k: undefined, b: -x1 };
            }
            if (deltaY == 0) {
                return { k: 0, b: y1 };
            }
            if (deltaX != 0 && deltaY != 0) {
                b = (y2 * x1 - y1 * x2) / (x1 - x2);
                if (x2 != 0) {
                    k = (y2 - b) / x2;
                } else {
                    k = (y1 - b) / x1;
                }
            }
            return { 'b': b, 'k': k };
        }
    }]);

    return MathTools;
}();

exports.default = MathTools;