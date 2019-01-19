"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var temp_mat3Array = undefined;

var Mat3 = function () {
    function Mat3() {
        _classCallCheck(this, Mat3);
    }

    _createClass(Mat3, null, [{
        key: "projection",
        value: function projection(width, height) {
            var m = this.identity();
            m[0] = 2 / width;
            m[4] = -2 / height;
            m[6] = -1;
            m[7] = 1;
            m[8] = 1;
            return m;
        }
    }, {
        key: "identity",
        value: function identity(out) {
            if (out == undefined) {
                // out = [0, 0, 0, 0, 0, 0, 0, 0, 0];
                out = new Float32Array(9);
                out[0] = 1;
                out[4] = 1;
                out[8] = 1;
            } else {
                out[0] = 1;
                out[1] = 0;
                out[2] = 0;
                out[3] = 0;
                out[4] = 1;
                out[5] = 0;
                out[6] = 0;
                out[7] = 0;
                out[8] = 1;
            }
            return out;
        }
    }, {
        key: "translate",
        value: function translate(out, tx, ty) {
            var x = void 0,
                y = void 0,
                m = void 0;
            if (arguments.length == 3) {
                m = out;
                this.identity(m);
                x = tx;
                y = ty;
            }
            if (arguments.length == 2) {
                x = out;
                y = tx;
                m = this.identity();
            }
            m[6] = x;
            m[7] = y;
            return m;
        }
    }, {
        key: "rotate",
        value: function rotate(out, radian) {
            var theta = void 0,
                m = void 0;
            if (arguments.length == 2) {
                m = out;
                this.identity(m);
                theta = radian;
            }
            if (arguments.length == 1) {
                theta = out;
                m = this.identity();
            }
            var c = Math.cos(theta);
            var s = Math.sin(theta);
            m[0] = c;
            m[1] = s;
            m[3] = -s;
            m[4] = c;
            return m;
        }
    }, {
        key: "scale",
        value: function scale(out, sx, sy) {
            var x = void 0,
                y = void 0,
                m = void 0;
            if (arguments.length == 3) {
                m = out;
                this.identity(m);
                x = sx;
                y = sy;
            }
            if (arguments.length == 2) {
                x = out;
                y = sx;
                m = this.identity();
            }
            m[0] = x;
            m[4] = y;
            return m;
        }
    }, {
        key: "copy",
        value: function copy(from, to) {
            to[0] = from[0];
            to[1] = from[1];
            to[2] = from[2];
            to[3] = from[3];
            to[4] = from[4];
            to[5] = from[5];
            to[6] = from[6];
            to[7] = from[7];
            to[8] = from[8];
        }
    }, {
        key: "multiplyWithVertex",
        value: function multiplyWithVertex(outMatrix, matrix, v2) {
            var m = void 0;
            var out = void 0;
            var vertex = void 0;
            if (arguments.length == 3) {
                m = matrix;
                out = outMatrix;
                vertex = v2;
            }
            if (arguments.length == 2) {
                m = outMatrix;
                vertex = matrix;
            }
            if (out == undefined) out = Mat3.identity();
            var a00 = m[0],
                a01 = m[1],
                a02 = m[2];
            var a10 = m[3],
                a11 = m[4],
                a12 = m[5];
            var a20 = m[6],
                a21 = m[7],
                a22 = m[8];

            var b0 = vertex[0],
                b1 = vertex[1],
                b2 = vertex[2];
            if (b2 == undefined) b2 = 1;

            out[0] = b0 * a00 + b1 * a10 + b2 * a20;
            out[1] = b0 * a01 + b1 * a11 + b2 * a21;
            out[2] = b0 * a02 + b1 * a12 + b2 * a22;
            return out;
        }
    }, {
        key: "multiply",
        value: function multiply(out, a, b) {

            var a00 = a[0],
                a01 = a[1],
                a02 = a[2];
            var a10 = a[3],
                a11 = a[4],
                a12 = a[5];
            var a20 = a[6],
                a21 = a[7],
                a22 = a[8];

            var b00 = b[0],
                b01 = b[1],
                b02 = b[2];
            var b10 = b[3],
                b11 = b[4],
                b12 = b[5];
            var b20 = b[6],
                b21 = b[7],
                b22 = b[8];

            out[0] = b00 * a00 + b01 * a10 + b02 * a20;
            out[1] = b00 * a01 + b01 * a11 + b02 * a21;
            out[2] = b00 * a02 + b01 * a12 + b02 * a22;

            out[3] = b10 * a00 + b11 * a10 + b12 * a20;
            out[4] = b10 * a01 + b11 * a11 + b12 * a21;
            out[5] = b10 * a02 + b11 * a12 + b12 * a22;

            out[6] = b20 * a00 + b21 * a10 + b22 * a20;
            out[7] = b20 * a01 + b21 * a11 + b22 * a21;
            out[8] = b20 * a02 + b21 * a12 + b22 * a22;
            return out;
        }
    }, {
        key: "TEMP_MAT3",
        get: function get() {
            if (temp_mat3Array == undefined) {
                temp_mat3Array = [Mat3.identity(), Mat3.identity(), Mat3.identity(), Mat3.identity()];
            }
            return temp_mat3Array;
        }
    }]);

    return Mat3;
}();

exports.default = Mat3;