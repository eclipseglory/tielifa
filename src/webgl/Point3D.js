'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _point = Symbol('存放坐标值的Float32数组');
var _transformMatrixIndex = Symbol('坐标转换矩阵索引');
/**
 * @deprecated
 */

var Point3D = function () {
    function Point3D(x, y, z) {
        _classCallCheck(this, Point3D);

        this[_point] = new Float32Array(3);
        this[_transformMatrixIndex] = new Uint16Array(2);
        this[_point][0] = x;
        this[_point][1] = y;
        this[_point][2] = z;
    }

    _createClass(Point3D, [{
        key: 'matrixIdData',
        get: function get() {
            return this[_transformMatrixIndex];
        }
    }, {
        key: 'contextStateIndex',
        get: function get() {
            return this[_transformMatrixIndex][0];
        },
        set: function set(index) {
            this[_transformMatrixIndex][0] = index;
        }
    }, {
        key: 'transformMatrixIndex',
        get: function get() {
            return this[_transformMatrixIndex][1];
        },
        set: function set(index) {
            this[_transformMatrixIndex][1] = index;
        }
    }, {
        key: 'value',
        get: function get() {
            return this[_point];
        },
        set: function set(value) {
            this[_point][0] = value[0];
            this[_point][1] = value[1];
            this[_point][2] = value[2];
        }
    }, {
        key: 'x',
        get: function get() {
            return this[_point][0];
        },
        set: function set(x) {
            this[_point][0] = x;
        }
    }, {
        key: 'y',
        get: function get() {
            return this[_point][1];
        },
        set: function set(y) {
            this[_point][1] = y;
        }
    }, {
        key: 'z',
        get: function get() {
            return this[_point][2];
        },
        set: function set(z) {
            this[_point][2] = z;
        }
    }]);

    return Point3D;
}();

exports.default = Point3D;