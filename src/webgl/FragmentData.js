"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseBufferData = require("./BaseBufferData.js");

var _BaseBufferData2 = _interopRequireDefault(_BaseBufferData);

var _Tools = require("../utils/Tools.js");

var _Tools2 = _interopRequireDefault(_Tools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SINGLE_DATA_BYTE_LENGTH = 16;
/**
 * 0-2 分别是3位uint8类型的颜色数据
 * 3-6: 1位float32的alpha值
 * 7-14：两位float32的贴图坐标值
 * 15：int8类型的贴图索引值
 */

var FragmentData = function () {
    function FragmentData(verticesNum) {
        _classCallCheck(this, FragmentData);

        this.buffer = new ArrayBuffer(verticesNum * SINGLE_DATA_BYTE_LENGTH);
        this.dv = new DataView(this.buffer);
        this.currentIndex = 0;
        this.isLittleEndian = _Tools2.default.littleEndian;
    }

    _createClass(FragmentData, [{
        key: "setFragmentData",
        value: function setFragmentData(r, g, b, alpha, u, v, textureIndex, filterType, index) {
            index = index * this.singleDataByteLength;
            this.dv.setUint8(index, r);
            this.dv.setUint8(index + 1, g);
            this.dv.setUint8(index + 2, b);
            this.dv.setUint8(index + 3, filterType);
            index += 4;

            this.dv.setFloat32(index, alpha, this.isLittleEndian);
            this.dv.setFloat32(index + 4, u, this.isLittleEndian);
            this.dv.setFloat32(index + 8, v, this.isLittleEndian);
        }
    }, {
        key: "init",
        value: function init() {
            this.currentIndex = 0;
        }
    }, {
        key: "resize",
        value: function resize(length) {
            if (length <= this.totalByteLength) {
                return;
            }
            var oldBuffer = this.buffer;
            this.buffer = new ArrayBuffer(length);
            var dv1 = new Uint8Array(oldBuffer);
            var ndv = new Uint8Array(this.buffer);
            ndv.set(dv1, 0);
            this.dv = new DataView(this.buffer);
        }
    }, {
        key: "append",
        value: function append(fragmentData) {
            var vertexNum = this.currentIndex;
            var len = fragmentData.totalByteLength;
            this.resize(len + vertexNum * SINGLE_DATA_BYTE_LENGTH);
            var dv1 = new Uint8Array(fragmentData.buffer);
            var ndv = new Uint8Array(this.buffer);
            ndv.set(dv1, vertexNum * SINGLE_DATA_BYTE_LENGTH);
            this.currentIndex += fragmentData.currentIndex;
        }
    }, {
        key: "addFragmentData",
        value: function addFragmentData(r, g, b, alpha, u, v, textureIndex, filterType) {
            var index = this.currentIndex;
            if (index * this.singleDataByteLength >= this.totalByteLength) {
                this.resize(this.totalByteLength * 2);
            }
            this.setFragmentData(r, g, b, alpha, u, v, textureIndex, filterType, index);
            this.currentIndex++;
        }
    }, {
        key: "totalByteLength",
        get: function get() {
            return this.buffer.byteLength;
        }
    }, {
        key: "singleDataByteLength",
        get: function get() {
            return SINGLE_DATA_BYTE_LENGTH;
        }
    }]);

    return FragmentData;
}();

exports.default = FragmentData;