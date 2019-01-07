"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Tools = require("../utils/Tools.js");

var _Tools2 = _interopRequireDefault(_Tools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var temp_mat4 = undefined;

var Mat4 = function () {
    function Mat4() {
        _classCallCheck(this, Mat4);
    }

    _createClass(Mat4, null, [{
        key: "perspective",
        value: function perspective(fieldOfViewInRadians, aspect, near, far) {
            var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
            var rangeInv = 1.0 / (near - far);
            var m = this.identity();
            m[0] = f / aspect;
            m[5] = f;
            m[10] = (near + far) * rangeInv;
            m[11] = -1;
            m[14] = near * far * rangeInv * 2;

            return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (near + far) * rangeInv, -1, 0, 0, near * far * rangeInv * 2, 0];
            // return m;
        }
    }, {
        key: "orthoProjection",
        value: function orthoProjection(left, top, right, bottom, near, far) {
            return new Float32Array([2 / (right - left), 0, 0, 0, 0, 2 / (top - bottom), 0, 0, 0, 0, 2 / (near - far), 0, (left + right) / (left - right), (bottom + top) / (bottom - top), (near + far) / (near - far), 1]);
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
            to[9] = from[9];
            to[10] = from[10];
            to[11] = from[11];
            to[12] = from[12];
            to[13] = from[13];
            to[14] = from[14];
            to[15] = from[15];
        }
    }, {
        key: "equals",
        value: function equals(a, b) {
            var a0 = a[0],
                a1 = a[1],
                a2 = a[2],
                a3 = a[3];
            var a4 = a[4],
                a5 = a[5],
                a6 = a[6],
                a7 = a[7];
            var a8 = a[8],
                a9 = a[9],
                a10 = a[10],
                a11 = a[11];
            var a12 = a[12],
                a13 = a[13],
                a14 = a[14],
                a15 = a[15];

            var b0 = b[0],
                b1 = b[1],
                b2 = b[2],
                b3 = b[3];
            var b4 = b[4],
                b5 = b[5],
                b6 = b[6],
                b7 = b[7];
            var b8 = b[8],
                b9 = b[9],
                b10 = b[10],
                b11 = b[11];
            var b12 = b[12],
                b13 = b[13],
                b14 = b[14],
                b15 = b[15];

            return Math.abs(a0 - b0) <= _Tools2.default.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= _Tools2.default.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= _Tools2.default.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= _Tools2.default.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= _Tools2.default.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= _Tools2.default.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= _Tools2.default.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= _Tools2.default.EPSILON.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= _Tools2.default.EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= _Tools2.default.EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= _Tools2.default.EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= _Tools2.default.EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= _Tools2.default.EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= _Tools2.default.EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= _Tools2.default.EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= _Tools2.default.EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15));
        }
    }, {
        key: "exactEquals",
        value: function exactEquals(a, b) {
            return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
        }
    }, {
        key: "projection",
        value: function projection(width, height, depth) {
            var m = this.identity();
            m[0] = 2 / width;
            m[5] = -2 / height;
            m[10] = 2 / depth;
            m[12] = -1;
            m[13] = 1;
            m[15] = 1;
            return m;
        }
    }, {
        key: "identity",
        value: function identity() {
            var m = new Float32Array(16);
            m[0] = 1;
            m[5] = 1;
            m[10] = 1;
            m[15] = 1;
            return m;
        }
    }, {
        key: "identityMatrix",
        value: function identityMatrix(matrix) {
            var m = matrix;
            m[0] = 1;
            m[1] = 0;
            m[2] = 0;
            m[3] = 0;
            m[4] = 0;
            m[5] = 1;
            m[6] = 0;
            m[7] = 0;
            m[8] = 0;
            m[9] = 0;
            m[10] = 1;
            m[11] = 0;
            m[12] = 0;
            m[13] = 0;
            m[14] = 0;
            m[15] = 1;
        }
    }, {
        key: "translationMatrix",
        value: function translationMatrix(out, tx, ty, tz) {
            var m = out;
            m[0] = 1;
            m[1] = 0;
            m[2] = 0;
            m[3] = 0;
            m[4] = 0;
            m[5] = 1;
            m[6] = 0;
            m[7] = 0;
            m[8] = 0;
            m[9] = 0;
            m[10] = 1;
            m[11] = 0;
            m[12] = tx;
            m[13] = ty;
            m[14] = tz;
            m[15] = 1;
        }
    }, {
        key: "translation",
        value: function translation(tx, ty, tz) {
            var m = this.identity();
            m[12] = tx;
            m[13] = ty;
            m[14] = tz;
            return m;
        }
    }, {
        key: "rotationZMatrix",
        value: function rotationZMatrix(out, radian) {
            var m = out;
            m[2] = 0;
            m[3] = 0;
            m[6] = 0;
            m[7] = 0;
            m[8] = 0;
            m[9] = 0;
            m[10] = 1;
            m[11] = 0;
            m[12] = 0;
            m[13] = 0;
            m[14] = 0;
            m[15] = 1;

            var c = Math.cos(radian);
            var s = Math.sin(radian);
            m[0] = c;
            m[1] = s;
            m[4] = -s;
            m[5] = c;
        }
    }, {
        key: "rotationZ",
        value: function rotationZ(angleInRadians) {
            var c = Math.cos(angleInRadians);
            var s = Math.sin(angleInRadians);
            var m = this.identity();
            m[0] = c;
            m[1] = s;
            m[4] = -s;
            m[5] = c;
            return m;
        }
    }, {
        key: "rotationXMatrix",
        value: function rotationXMatrix(out, radian) {
            var m = out;
            m[0] = 1;
            m[1] = 0;
            m[2] = 0;
            m[3] = 0;
            m[4] = 0;
            m[7] = 0;
            m[8] = 0;
            m[11] = 0;
            m[12] = 0;
            m[13] = 0;
            m[14] = 0;
            m[15] = 1;

            var c = Math.cos(radian);
            var s = Math.sin(radian);
            m[5] = c;
            m[6] = s;
            m[9] = -s;
            m[10] = c;
        }
    }, {
        key: "rotationX",
        value: function rotationX(angleInRadians) {
            var c = Math.cos(angleInRadians);
            var s = Math.sin(angleInRadians);
            var m = this.identity();
            m[5] = c;
            m[6] = s;
            m[9] = -s;
            m[10] = c;
            return m;
        }
    }, {
        key: "rotationYMatrix",
        value: function rotationYMatrix(out, radian) {
            var m = out;
            m[1] = 0;
            m[3] = 0;
            m[4] = 0;
            m[5] = 1;
            m[6] = 0;
            m[7] = 0;
            m[9] = 0;
            m[11] = 0;
            m[12] = 0;
            m[13] = 0;
            m[14] = 0;
            m[15] = 1;

            var c = Math.cos(radian);
            var s = Math.sin(radian);
            m[0] = c;
            m[2] = -s;
            m[8] = s;
            m[10] = c;
        }
    }, {
        key: "rotationY",
        value: function rotationY(angleInRadians) {
            var c = Math.cos(angleInRadians);
            var s = Math.sin(angleInRadians);
            var m = this.identity();
            m[0] = c;
            m[2] = -s;
            m[8] = s;
            m[10] = c;
            return m;
        }
    }, {
        key: "scalingMatrix",
        value: function scalingMatrix(out, sx, sy, sz) {
            var m = out;
            m[0] = sx;
            m[1] = 0;
            m[2] = 0;
            m[3] = 0;
            m[4] = 0;
            m[5] = sy;
            m[6] = 0;
            m[7] = 0;
            m[8] = 0;
            m[9] = 0;
            m[10] = sz;
            m[11] = 0;
            m[12] = 0;
            m[13] = 0;
            m[14] = 0;
            m[15] = 1;
        }
    }, {
        key: "scaling",
        value: function scaling(sx, sy, sz) {
            var m = this.identity();
            m[0] = sx;
            m[5] = sy;
            m[10] = sz;
            return m;
        }
    }, {
        key: "multiplyWithVertex",
        value: function multiplyWithVertex(matrix, vertex) {
            var a00 = matrix[0];
            var a01 = matrix[1];
            var a02 = matrix[2];
            var a03 = matrix[3];
            var a10 = matrix[4];
            var a11 = matrix[5];
            var a12 = matrix[6];
            var a13 = matrix[7];
            var a20 = matrix[8];
            var a21 = matrix[9];
            var a22 = matrix[10];
            var a23 = matrix[11];
            var a30 = matrix[12];
            var a31 = matrix[13];
            var a32 = matrix[14];
            var a33 = matrix[15];

            var b00 = vertex[0];
            var b01 = vertex[1];
            var b02 = vertex[2];
            var b03 = vertex[3];
            if (b02 == undefined) b02 = 0;
            if (b03 == undefined) b03 = 1;

            return [b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30, b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31, b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32, b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33];
        }
    }, {
        key: "multiply",
        value: function multiply(out, a, b) {
            var a00 = a[0],
                a01 = a[1],
                a02 = a[2],
                a03 = a[3];
            var a10 = a[4],
                a11 = a[5],
                a12 = a[6],
                a13 = a[7];
            var a20 = a[8],
                a21 = a[9],
                a22 = a[10],
                a23 = a[11];
            var a30 = a[12],
                a31 = a[13],
                a32 = a[14],
                a33 = a[15];

            // Cache only the current line of the second matrix
            var b0 = b[0],
                b1 = b[1],
                b2 = b[2],
                b3 = b[3];
            out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[4];
            b1 = b[5];
            b2 = b[6];
            b3 = b[7];
            out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[8];
            b1 = b[9];
            b2 = b[10];
            b3 = b[11];
            out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[12];
            b1 = b[13];
            b2 = b[14];
            b3 = b[15];
            out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
            return out;
        }
    }, {
        key: "TEMP_MAT4",
        get: function get() {
            if (temp_mat4 == undefined) {
                temp_mat4 = [Mat4.identity(), Mat4.identity(), Mat4.identity(), Mat4.identity()];
            }
            return temp_mat4;
        }
    }, {
        key: "EPSILON",
        get: function get() {
            return _Tools2.default.EPSILON;
        }
    }]);

    return Mat4;
}();

exports.default = Mat4;