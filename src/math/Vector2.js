"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2018. 老脸叔叔创建，版权归老脸叔叔所有
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _Tools = require("../utils/Tools.js");

var _Tools2 = _interopRequireDefault(_Tools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _value = Symbol('二维向量值数组,0是x，1是y');
// 这是一个可以临时使用的vector数组，便于计算的时候不浪费内存
var TEMP_VECTORS = undefined;

var Vector2 = function () {
    _createClass(Vector2, [{
        key: "x",
        get: function get() {
            return this[_value][0];
        },
        set: function set(value) {
            this[_value][0] = value;
        }
    }, {
        key: "y",
        get: function get() {
            return this[_value][1];
        },
        set: function set(value) {
            this[_value][1] = value;
        }
    }, {
        key: "value",
        get: function get() {
            return this[_value];
        },
        set: function set(value) {
            this[_value][0] = value[0];
            this[_value][1] = value[1];
        }
    }, {
        key: "radian",
        get: function get() {
            return Math.atan2(this.y, this.x);
        }
    }, {
        key: "magnitude",
        get: function get() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
    }], [{
        key: "rotate",
        value: function rotate(out, sourceVector, radian) {
            var cos = Math.cos(radian),
                sin = Math.sin(radian);
            if (!out) out = {};
            out.y = sourceVector.x * sin + sourceVector.y * cos;
            out.x = sourceVector.x * cos - sourceVector.y * sin;
            return out;
        }
    }, {
        key: "rotateAbout",
        value: function rotateAbout(output, vector, rotatePoint, radian) {
            var c = Math.cos(radian);
            var s = Math.sin(radian);
            if (!output) output = {};
            output.x = rotatePoint.x + ((vector.x - rotatePoint.x) * c - (vector.y - rotatePoint.y) * s);
            output.y = rotatePoint.y + ((vector.x - rotatePoint.x) * s + (vector.y - rotatePoint.y) * c);
            return output;
        }
    }, {
        key: "normalize",
        value: function normalize(out, vector) {
            var magnitude = vector.magnitude;
            if (out == undefined) out = vector.clone();else {
                if (out != vector) {
                    out.x = vector.x;
                    out.y = vector.y;
                }
            }
            if (magnitude == 0) {
                out.x = 0;
                out.y = 0;
                return out;
            }
            out.x = out.x / magnitude;
            out.y = out.y / magnitude;
            return out;
        }
    }, {
        key: "multiplyValue",
        value: function multiplyValue(out, v, value) {
            var v1 = v.x * value;
            var v2 = v.y * value;
            out.x = v1;
            out.y = v2;
        }
    }, {
        key: "dot",
        value: function dot(v1, v2) {
            return v1.x * v2.x + v1.y * v2.y;
        }
    }, {
        key: "cross",
        value: function cross(v1, v2) {
            return v1.x * v2.y - v1.y * v2.x;
        }
    }, {
        key: "crossZ",
        value: function crossZ(out, v, z) {
            // A x B = (AyBz - AzBy , AzBx - AxBz , AxBy - AyBx)
            // 所以把这个二维向量看成(Vx,Vy,0),这个z就是(0,0,z)，得到：
            out.x = v.y * z;
            out.y = -(v.x * z);
            return out;
        }
    }, {
        key: "zCrossVector",
        value: function zCrossVector(out, z, v) {
            out.x = -z * v.y;
            out.y = z * v.x;
            return out;
        }
    }, {
        key: "plus",
        value: function plus(out, v1, v2) {
            out.x = v1.x + v2.x;
            out.y = v1.y + v2.y;
            return out;
        }
    }, {
        key: "sub",
        value: function sub(out, v1, v2) {
            out.x = v1.x - v2.x;
            out.y = v1.y - v2.y;
            return out;
        }
    }, {
        key: "TEMP_VECTORS",
        get: function get() {
            if (TEMP_VECTORS == undefined) {
                TEMP_VECTORS = [new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0)];
            }
            return TEMP_VECTORS;
        }
    }]);

    function Vector2(x, y) {
        _classCallCheck(this, Vector2);

        this[_value] = new Float32Array(2);
        if (x != null || x != undefined) this.x = x;
        if (y != null || y != undefined) this.y = y;
    }

    _createClass(Vector2, [{
        key: "add",
        value: function add(vector) {
            this.x += vector.x;
            this.y += vector.y;
            return this;
        }
    }, {
        key: "subtract",
        value: function subtract(vector) {
            this.x -= vector.x;
            this.y -= vector.y;
            return this;
        }
    }, {
        key: "multiply",
        value: function multiply(value) {
            this.x *= value;
            this.y *= value;
            return this;
        }
    }, {
        key: "split",
        value: function split(radian1, radian2) {
            var maxRadian = Math.max(radian1, radian2);
            var minRadian = Math.min(radian1, radian2);
            console.log(maxRadian, minRadian);
            var nr = Math.PI - (maxRadian - minRadian);
            var d = this.magnitude / Math.sin(nr);
            var nr2 = maxRadian - this.radian;
            var nr1 = Math.PI - nr2 - nr;
            var value1 = d * Math.sin(nr1);
            var value2 = d * Math.sin(nr2);
            var vectorMax = Vector2.createVector(value2, minRadian);
            var vectorMin = Vector2.createVector(value1, maxRadian);
            vectorMax.add(vectorMin);
        }
    }, {
        key: "splitWithRightAngle",
        value: function splitWithRightAngle(horizontalRadian) {
            this.rotate(-horizontalRadian);
            var hVector = new Vector2(this.x, 0);
            var vVector = new Vector2(0, this.y);
            hVector.rotate(horizontalRadian);
            vVector.rotate(horizontalRadian);
            this.rotate(horizontalRadian);
            return { hVector: hVector, vVector: vVector };
        }
    }, {
        key: "reverse",
        value: function reverse() {
            this.x = -this.x;
            this.y = -this.y;
            return this;
        }
    }, {
        key: "rotate",
        value: function rotate(radian) {
            var nradian = this.radian + radian;
            var value = this.magnitude;
            this.x = Math.abs(value) * Math.cos(nradian);
            this.y = Math.abs(value) * Math.sin(nradian);
        }
    }, {
        key: "clone",
        value: function clone() {
            return new Vector2(this.x, this.y);
        }
    }], [{
        key: "createVector",
        value: function createVector(value, radian) {
            var x = Math.abs(value) * Math.cos(radian);
            if (Math.abs(x) < _Tools2.default.EPSILON) {
                x = 0;
            }
            var y = Math.abs(value) * Math.sin(radian);
            if (Math.abs(y) < _Tools2.default.EPSILON) {
                y = 0;
            }
            return new Vector2(x, y);
        }
    }]);

    return Vector2;
}();

exports.default = Vector2;