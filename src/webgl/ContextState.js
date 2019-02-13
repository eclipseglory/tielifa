"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Mat = require("../math/Mat4.js");

var _Mat2 = _interopRequireDefault(_Mat);

var _Tools = require("../utils/Tools.js");

var _Tools2 = _interopRequireDefault(_Tools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Normal_Filter = 0;
var GaussianBlur_Filter = 1;
var Unsharpen_Filter = 2;
var Sharpness_Filter = 3;
var Sharpen_Filter = 4;
var EdgeDetect_Filter = 5;
var SobelHorizontal_Filter = 6;
var SobelVertical_Filter = 7;
var PrevitHorizontal_Filter = 8;
var PrevitVertical_Filter = 9;
var BoxBlur_Filter = 10;
var TriangleBlur_Filter = 11;
var Emboss_Filter = 12;

var ContextState = function () {
    function ContextState(canvasDrawingStyle) {
        _classCallCheck(this, ContextState);

        this.canvasDrawingStyle = canvasDrawingStyle;
        this.matrixIndex = 0;
        this.fillStyle = '#000000';
        this.strokeStyle = '#000000';
        this.globalAlpha = 1;
        this.id = -1;
        this.matrix = _Mat2.default.identity();
        this.filterType = Normal_Filter;
        this.dirty = false;
    }

    _createClass(ContextState, [{
        key: "setTransformMatrix",
        value: function setTransformMatrix(value) {
            // let current = this.transformMatrix.matrix;
            _Mat2.default.copy(value, this.matrix);
        }
    }, {
        key: "applyTransform",
        value: function applyTransform(currentTransformMatrix) {
            var lastMatrix = this.matrix;
            _Mat2.default.multiply(lastMatrix, lastMatrix, currentTransformMatrix);
        }
    }, {
        key: "translate",
        value: function translate(x, y, z) {
            if (z === undefined) z = 0;
            if (_Tools2.default.equals(x, 0) && _Tools2.default.equals(y, 0) && _Tools2.default.equals(z, 0)) {
                return;
            }
            var m = _Mat2.default.TEMP_MAT4[0];
            _Mat2.default.translationMatrix(m, x, y, z);
            this.applyTransform(m);
        }

        // 默然是按照z轴旋转

    }, {
        key: "rotateZ",
        value: function rotateZ(radian) {
            if (_Tools2.default.equals(radian, 0)) {
                return;
            }
            var m = _Mat2.default.TEMP_MAT4[0];
            _Mat2.default.rotationZMatrix(m, radian);
            this.applyTransform(m);
        }
    }, {
        key: "rotateX",
        value: function rotateX(radian) {
            if (_Tools2.default.equals(radian, 0)) {
                return;
            }
            var m = _Mat2.default.TEMP_MAT4[0];
            _Mat2.default.rotationXMatrix(m, radian);
            this.applyTransform(m);
        }
    }, {
        key: "rotateY",
        value: function rotateY(radian) {
            if (_Tools2.default.equals(radian, 0)) {
                return;
            }
            var m = _Mat2.default.TEMP_MAT4[0];
            _Mat2.default.rotationYMatrix(m, radian);
            this.applyTransform(m);
        }
    }, {
        key: "scale",
        value: function scale(scaleX, scaleY, scaleZ) {
            if (scaleZ === undefined) scaleZ = 1;
            if (_Tools2.default.equals(scaleX, 1) && _Tools2.default.equals(scaleY, 1) && _Tools2.default.equals(scaleZ, 1)) {
                return;
            }
            var m = _Mat2.default.TEMP_MAT4[0];
            _Mat2.default.scalingMatrix(m, scaleX, scaleY, scaleZ);
            this.applyTransform(m);
        }
    }, {
        key: "clone",
        value: function clone() {
            var newState = new ContextState(this.canvasDrawingStyle.clone());
            newState.fillStyle = this.fillStyle;
            newState.strokeStyle = this.strokeStyle;
            newState.globalAlpha = this.globalAlpha;
            newState.filterType = this.filterType;
            // newState.matrixIndex = this.matrixIndex;
            // 把当前的矩阵作为新矩阵的最后一个
            newState.setTransformMatrix(this.transformMatrix);
            return newState;
        }
    }, {
        key: "transformMatrixId",


        /**@deprecated*/
        get: function get() {
            return ContextState.matrixList.length - 1;
        }
    }, {
        key: "transformMatrix",
        get: function get() {
            return this.matrix;
            // let index = ContextState.matrixList.length - 1;
            // let m = ContextState.matrixList[index];
            // return {matrix: m, id: index};
        }
    }, {
        key: "lineWidth",
        get: function get() {
            return this.canvasDrawingStyle.lineWidth;
        },
        set: function set(width) {
            this.canvasDrawingStyle.lineWidth = width;
        }
    }, {
        key: "textAlign",
        get: function get() {
            return this.canvasDrawingStyle.textAlign;
        },
        set: function set(textAlign) {
            this.canvasDrawingStyle.textAlign = textAlign;
        }
    }, {
        key: "textBaseline",
        get: function get() {
            return this.canvasDrawingStyle.textBaseline;
        },
        set: function set(textBaseline) {
            this.canvasDrawingStyle.textBaseline = textBaseline;
        }
    }], [{
        key: "Normal_Filter",
        get: function get() {
            return Normal_Filter;
        }
    }, {
        key: "GaussianBlur_Filter",
        get: function get() {
            return GaussianBlur_Filter;
        }
    }, {
        key: "Unsharpen_Filter",
        get: function get() {
            return Unsharpen_Filter;
        }
    }, {
        key: "Sharpness_Filter",
        get: function get() {
            return Sharpen_Filter;
        }
    }, {
        key: "Sharpen_Filter",
        get: function get() {
            return Sharpen_Filter;
        }
    }, {
        key: "EdgeDetect_Filter",
        get: function get() {
            return EdgeDetect_Filter;
        }
    }, {
        key: "SobelHorizontal_Filter",
        get: function get() {
            return SobelHorizontal_Filter;
        }
    }, {
        key: "SobelVertical_Filter",
        get: function get() {
            return SobelVertical_Filter;
        }
    }, {
        key: "PrevitHorizontal_Filter",
        get: function get() {
            return PrevitHorizontal_Filter;
        }
    }, {
        key: "PrevitVertical_Filter",
        get: function get() {
            return PrevitVertical_Filter;
        }
    }, {
        key: "BoxBlur_Filter",
        get: function get() {
            return BoxBlur_Filter;
        }
    }, {
        key: "TriangleBlur_Filter",
        get: function get() {
            return TriangleBlur_Filter;
        }
    }, {
        key: "Emboss_Filter",
        get: function get() {
            return Emboss_Filter;
        }
    }]);

    return ContextState;
}();

exports.default = ContextState;