"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Tools = require("../utils/Tools.js");

var _Tools2 = _interopRequireDefault(_Tools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var temp = undefined;

var Vector3 = function () {
    function Vector3(x, y, z) {
        _classCallCheck(this, Vector3);

        this.value = new Float32Array(4);
        // this.value = [0, 0, 0, 1];//多一位是免得和mat计算时还要自动加一个
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.value[3] = 1;
    }

    _createClass(Vector3, [{
        key: "x",
        get: function get() {
            return this.value[0];
        },
        set: function set(v) {
            this.value[0] = v;
        }
    }, {
        key: "y",
        get: function get() {
            return this.value[1];
        },
        set: function set(v) {
            this.value[1] = v;
        }
    }, {
        key: "z",
        get: function get() {
            return this.value[2];
        },
        set: function set(v) {
            this.value[2] = v;
        }
    }, {
        key: "magnitude",
        get: function get() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        }
    }], [{
        key: "dot",
        value: function dot(v1, v2) {
            return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
        }
    }, {
        key: "normalize",
        value: function normalize(out, v) {
            var length = v.magnitude;
            if (_Tools2.default.equals(0, length)) {
                out.x = 0;
                out.y = 0;
                out.z = 0;
            } else {
                out.x = v.x / length;
                out.y = v.y / length;
                out.z = v.z / length;
                // if(Tools.equals(out.x , 0))out.x = 0;
                // if(Tools.equals(out.y , 0))out.y = 0;
                // if(Tools.equals(out.z , 0))out.z = 0;
            }
        }
    }, {
        key: "plus",
        value: function plus(out, v1, v2) {
            out.x = v1.x + v2.x;
            out.y = v1.y + v2.y;
            out.z = v1.z + v2.z;
            return out;
        }
    }, {
        key: "multiplyValue",
        value: function multiplyValue(out, v, value) {
            out.x = v.x * value;
            out.y = v.y * value;
            out.z = v.z * value;
            return out;
        }
    }, {
        key: "copy",
        value: function copy(from, to) {
            to.x = from.x;
            to.y = from.y;
            to.z = from.z;
        }
    }, {
        key: "cross",
        value: function cross(out, v1, v) {
            out.x = v1.y * v.z - v1.z * v.y;
            out.y = v1.z * v.x - v1.x * v.z;
            out.z = v1.x * v.y - v1.y * v.x;
            return out;
        }
    }, {
        key: "TEMP_VECTORS",
        get: function get() {
            if (temp == undefined) {
                temp = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
            }
            return temp;
        }
    }]);

    return Vector3;
}();

exports.default = Vector3;