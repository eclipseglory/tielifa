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

// let _transformMatrix = Symbol('变换矩阵');
// let _matrixList = [];
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
        // this.matrixArray = [];
        // this.matrixArray.push(Mat4.identity());
        this.dirty = false;
    }

    // static get matrixList() {
    //     // matrix list永不为空
    //     if (_matrixList.length == 0)
    //         _matrixList.push(Mat4.identity());
    //     return _matrixList;
    // }
    //
    // static set matrixList(list) {
    //     _matrixList = list;
    // }

    /**@deprecated*/


    _createClass(ContextState, [{
        key: "fireDirty",
        value: function fireDirty() {
            this.dirty = true;
        }

        /**@deprecated*/

    }, {
        key: "setTransformMatrix",
        value: function setTransformMatrix(value) {
            // let current = this.transformMatrix.matrix;
            _Mat2.default.copy(value, this.matrix);
        }
        /**@deprecated*/

    }, {
        key: "checkDirty",
        value: function checkDirty() {
            // 如果当前的矩阵会被应用到某些节点上，则说明这个矩阵脏了，
            // 一旦变换矩阵就要保存一下，并把这个矩阵的克隆放入数组底
            // if (this.dirty) {
            //     let m1 = Mat4.identity();
            //     let lastMatrix = this.transformMatrix.matrix;
            //     Mat4.copy(lastMatrix, m1);
            //     ContextState.matrixList.push(m1);
            //     this.dirty = false;
            // }
        }
    }, {
        key: "applyTransform",
        value: function applyTransform(currentTransformMatrix) {
            this.checkDirty();
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
            // newState.matrixIndex = this.matrixIndex;
            // 把当前的矩阵作为新矩阵的最后一个
            newState.setTransformMatrix(this.transformMatrix);
            return newState;
        }
    }, {
        key: "transformMatrixId",
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
    }]);

    return ContextState;
}();

exports.default = ContextState;