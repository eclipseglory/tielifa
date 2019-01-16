'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TYPE_FLOAT32 = 4;
var TYPE_FLOAT64 = 8;
var TYPE_UINT8 = 2;
var TYPE_UINT16 = 3;
var TYPE_UINT32 = 0;
var TYPE_INT8 = 5;
var TYPE_INT16 = 6;
var TYPE_INT32 = 7;
var TYPE_UINT8CLAMPED = 1;

var _littleEndian = undefined;

var BaseBufferData = function () {
    function BaseBufferData(dataNum, singleDataByteLength) {
        _classCallCheck(this, BaseBufferData);

        this.singleDataByteLength = singleDataByteLength;
        this.buffer = new ArrayBuffer(dataNum * singleDataByteLength);
        this.dv = new DataView(this.buffer);
        this.currentIndex = 0;
        this.isLittleEndian = BaseBufferData.littleEndian();
    }

    _createClass(BaseBufferData, [{
        key: 'init',
        value: function init() {
            this.currentIndex = 0;
        }
    }, {
        key: 'getData',
        value: function getData(index, type, offset) {
            index = index * this.singleDataByteLength;
            if (type == undefined) type = TYPE_FLOAT32;
            if (offset == undefined) offset = 0;
            index += offset;
            var littleEndian = this.isLittleEndian;
            switch (type) {
                case TYPE_FLOAT64:
                    return this.dv.getFloat64(index, littleEndian);
                    break;
                case TYPE_UINT8CLAMPED:
                    return this.dv.getUint8(index);
                    break;
                case TYPE_INT8:
                    return this.dv.getInt8(index);
                    break;
                case TYPE_UINT8:
                    return this.dv.getUint8(index);
                    break;
                case TYPE_INT16:
                    return this.dv.getInt16(index, littleEndian);
                    break;
                case TYPE_UINT16:
                    return this.dv.getUint16(index, littleEndian);
                    break;
                case TYPE_FLOAT32:
                    return this.dv.getFloat32(index, littleEndian);
                    break;
                case TYPE_INT32:
                    return this.dv.getInt32(index, littleEndian);
                    break;
                case TYPE_UINT32:
                    return this.dv.getUint32(index, littleEndian);
                    break;
            }
        }
    }, {
        key: 'setData',
        value: function setData(value, index, type, offset) {
            var littleEndian = this.isLittleEndian;
            if (offset == undefined) offset = 0;
            if (type == undefined) type = TYPE_FLOAT32;
            index = index * this.singleDataByteLength;
            index += offset;
            switch (type) {
                case TYPE_FLOAT64:
                    this.dv.setFloat64(index, value, littleEndian);
                    break;
                case TYPE_UINT8CLAMPED:
                    this.dv.setUint8(index, value);
                    break;
                case TYPE_INT8:
                    this.dv.setInt8(index, value);
                    break;
                case TYPE_UINT8:
                    this.dv.setUint8(index, value);
                    break;
                case TYPE_INT16:
                    this.dv.setInt16(index, value, littleEndian);
                    break;
                case TYPE_UINT16:
                    this.dv.setUint16(index, value, littleEndian);
                    break;
                case TYPE_FLOAT32:
                    this.dv.setFloat32(index, value, littleEndian);
                    break;
                case TYPE_INT32:
                    this.dv.setInt32(index, value, littleEndian);
                    break;
                case TYPE_UINT32:
                    this.dv.setUint32(index, value, littleEndian);
                    break;
            }
        }
    }, {
        key: 'resize',
        value: function resize(length) {
            if (length < this.totalByteLength) throw Error('new length should not less than old length');
            var oldBuffer = this.buffer;
            this.buffer = new ArrayBuffer(length);
            var dv1 = new Uint8Array(oldBuffer);
            var ndv = new Uint8Array(this.buffer);
            ndv.set(dv1, 0);
            this.dv = new DataView(this.buffer);
        }
    }, {
        key: 'totalByteLength',
        get: function get() {
            return this.buffer.byteLength;
        }
    }], [{
        key: 'littleEndian',
        value: function littleEndian() {
            if (_littleEndian == undefined) {
                var arrayBuffer = new ArrayBuffer(2);
                var uint8Array = new Uint8Array(arrayBuffer);
                var uint16array = new Uint16Array(arrayBuffer);
                uint8Array[0] = 0xAA; // 第一位是AA
                uint8Array[1] = 0xBB; // 第二位是BB
                // 如果从16的view中读取数据，按照其排序就能得出高低位，以便DataView在设置值的时候能正确
                if (uint16array[0] === 0xBBAA) _littleEndian = true;
                if (uint16array[0] === 0xAABB) _littleEndian = false;
                return _littleEndian;
            } else {
                return _littleEndian;
            }
        }
    }, {
        key: 'TYPE_FLOAT32',
        get: function get() {
            return TYPE_FLOAT32;
        }
    }, {
        key: 'TYPE_FLOAT64',
        get: function get() {
            return TYPE_FLOAT64;
        }
    }, {
        key: 'TYPE_UINT8',
        get: function get() {
            return TYPE_UINT8;
        }
    }, {
        key: 'TYPE_UINT16',
        get: function get() {
            return TYPE_UINT16;
        }
    }, {
        key: 'TYPE_UINT32',
        get: function get() {
            return TYPE_UINT32;
        }
    }, {
        key: 'TYPE_INT8',
        get: function get() {
            return TYPE_INT8;
        }
    }, {
        key: 'TYPE_INT16',
        get: function get() {
            return TYPE_INT16;
        }
    }, {
        key: 'TYPE_INT32',
        get: function get() {
            return TYPE_INT32;
        }
    }, {
        key: 'TYPE_UINT8CLAMPED',
        get: function get() {
            return TYPE_UINT8CLAMPED;
        }
    }]);

    return BaseBufferData;
}();

exports.default = BaseBufferData;