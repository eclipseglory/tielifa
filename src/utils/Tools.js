"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EPSILON = 0.00001;
var PI2 = Math.PI * 2;
var littleEndian = undefined;

var Tools = function () {
    function Tools() {
        _classCallCheck(this, Tools);

        this.instance = null;
    }

    _createClass(Tools, null, [{
        key: "equals",
        value: function equals(a, b) {
            // return Math.abs(a - b) <= EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
            return Math.abs(a - b) <= EPSILON;
        }
    }, {
        key: "getDistance",
        value: function getDistance(point1, point2) {
            var dx = point1.x - point2.x;
            var dy = point1.y - point2.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        // static collisionResponse(v1, m1, v2, m2, n, e) {
        //     if (e == undefined) e = 1; // 恢复系数默认为1
        //     let m1d = undefined;
        //     let m2d = undefined;
        //     if (m1 == Infinity) {
        //         m2d = 1;
        //         m1d = 0;
        //     }
        //     if (m2 == Infinity) {
        //         m2d = 0;
        //         m1d = 1;
        //     }
        //     if (m1d == undefined && m2d == undefined) {
        //         m1d = 1 / m1;
        //         m2d = 1 / m2;
        //     }
        //     let up = 0 - (1 + e);
        //     let v12 = Vector2.TEMP_VECTORS[0];
        //     v12.x = v1.x - v2.x;
        //     v12.y = v1.y - v2.y;
        //     up = up * Vector2.dot(v12, n);
        //     let tempVector = v12;// {x: n.x, y: n.y};
        //     tempVector.x = n.x;
        //     tempVector.y = n.y;
        //     Vector2.multiplyValue(tempVector, tempVector, (m1d + m2d));
        //     let down = Vector2.dot(n, tempVector);
        //     let j = up / down;
        //
        //     tempVector.x = n.x;
        //     tempVector.y = n.y;
        //     Vector2.multiplyValue(tempVector, tempVector, j * m1d);
        //     let newV1 = {x: 0, y: 0};
        //     Vector2.add(newV1, v1, tempVector);
        //
        //     tempVector.x = n.x;
        //     tempVector.y = n.y;
        //     Vector2.multiplyValue(tempVector, tempVector, j * m2d);
        //     let newV2 = {x: 0, y: 0};
        //     Vector2.sub(newV2, v2, tempVector);
        //
        //     return {newV1: newV1, newV2: newV2};
        // }
        //
        //
        // getProjectionPointOnLine(point, linePoint1, linePoint2) {
        //     let p = point; // 线外一点p
        //     let a = linePoint1; // 线上端点a
        //     let b = linePoint2; // 线上端点b
        //     let ap = new Vector2(p.x - a.x, p.y - a.y);
        //     let ab = new Vector2(b.x - a.x, b.y - a.y);
        //     let abN = Vector2.normalize(ab, ab);//计算出ab的单位向量
        //     let compAP = Vector2.dot(ap, abN);//ap在ab上分量
        //     abN.multiply(compAP); //ap在ab上的投影,返回值就是abN
        //     let p0 = {x: 0, y: 0};
        //     Vector2.plus(p0, a, abN);
        //     return p0;
        // }

    }, {
        key: "clamp",
        value: function clamp(value, min, max) {
            if (value > max) {
                return max;
            }
            if (value < min) {
                return min;
            }
            return value;
        }
    }, {
        key: "getInsance",
        value: function getInsance() {
            if (this.instance == null) {
                this.instance = new Tools();
            }
            return this.instance;
        }
    }, {
        key: "overlaps",
        value: function overlaps(bounds1, bounds2) {
            var a = bounds1;
            var b = bounds2;
            return a.left <= b.right && a.right >= b.left && a.bottom >= b.top && a.top <= b.bottom;
        }
    }, {
        key: "isHit",
        value: function isHit(rect1, rect2) {
            var result = false;
            var x = rect1.left;
            var y = rect1.top;
            if (Tools.isInTheRect(x, y, rect2)) {
                result = true;
            }
            x = rect1.left;
            y = rect1.top + rect1.height;
            if (Tools.isInTheRect(x, y, rect2)) {
                result = true;
            }
            x = rect1.left + rect1.width;
            y = rect1.top;
            if (Tools.isInTheRect(x, y, rect2)) {
                result = true;
            }

            x = rect1.left + rect1.width;
            y = rect1.top + rect1.height;
            if (Tools.isInTheRect(x, y, rect2)) {
                result = true;
            }
            if (!result) {
                x = rect2.left;
                y = rect2.top;
                if (Tools.isInTheRect(x, y, rect1)) {
                    result = true;
                }
                x = rect2.left;
                y = rect2.top + rect2.height;
                if (Tools.isInTheRect(x, y, rect1)) {
                    result = true;
                }
                x = rect2.left + rect2.width;
                y = rect2.top;
                if (Tools.isInTheRect(x, y, rect1)) {
                    result = true;
                }

                x = rect2.left + rect2.width;
                y = rect2.top + rect2.height;
                if (Tools.isInTheRect(x, y, rect1)) {
                    result = true;
                }
            }
            return result;
        }
    }, {
        key: "isInTheRect",
        value: function isInTheRect(x, y, rect) {
            var fx = rect.left;
            var fy = rect.top;
            var currentWidth = rect.width;
            var currentHeight = rect.height;
            if (x > fx && x < fx + currentWidth && y > fy && y < fy + currentHeight) {
                return true;
            }
            return false;
        }
    }, {
        key: "PI2",
        get: function get() {
            return PI2;
        }
    }, {
        key: "EPSILON",
        get: function get() {
            return EPSILON;
        }
    }, {
        key: "littleEndian",
        get: function get() {
            if (littleEndian === undefined) {
                // DataView是默认按照高位存放，这里要做判断，更改存放顺序
                var arrayBuffer = new ArrayBuffer(2);
                var uint8Array = new Uint8Array(arrayBuffer);
                var uint16array = new Uint16Array(arrayBuffer);
                uint8Array[0] = 0xAA; // 第一位是AA
                uint8Array[1] = 0xBB; // 第二位是BB
                // 如果从16的view中读取数据，按照其排序就能得出高低位，以便DataView在设置值的时候能正确
                if (uint16array[0] === 0xBBAA) littleEndian = true;
                if (uint16array[0] === 0xAABB) littleEndian = false;
            }
            return littleEndian;
        }
    }]);

    return Tools;
}();

exports.default = Tools;