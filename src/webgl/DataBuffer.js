'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MAX_SINGLE_BYTE_LENGTH = 32 * 6 * 100; // 默认buffer长度就是100个矩形的长度
var TYPE_FLOAT32 = 4;
var TYPE_FLOAT64 = 8;
var TYPE_UINT8 = 2;
var TYPE_UINT16 = 3;
var TYPE_UINT32 = 0;
var TYPE_INT8 = 5;
var TYPE_INT16 = 6;
var TYPE_INT32 = 7;
var TYPE_UINT8CLAMPED = 1;
var _currentByteIndex = Symbol('当前buffer数据所在的字节索引');
var _singleDataFragmentSize = Symbol('单个数据块字节大小');
var _dataStructure = Symbol('ArrayBuffer的数据存放结构');
var _currentStructureIndex = Symbol('当前所在结构中的索引');
var littleEndian = undefined; // DataView是否是按照低位存放

var arrayBufferCache = {};
var cacheMaxsize = 16 * 1024 * 1024;
var currentCacheSize = 0;

var DataBuffer = function () {
    function DataBuffer(dataStructure, length) {
        _classCallCheck(this, DataBuffer);

        if (length === undefined) length = MAX_SINGLE_BYTE_LENGTH;
        var cacheBuffer = DataBuffer.getFromCache(length);
        this.buffer = null;
        this.dv = null;
        if (cacheBuffer == null) {
            this.buffer = new ArrayBuffer(length);
        } else {
            this.buffer = cacheBuffer.buffer;
            this.dv = cacheBuffer.dv;
        }
        if (this.dv == null || !(this.dv instanceof DataView)) {
            this.dv = new DataView(this.buffer);
        }

        // this.byteDv = new Uint8Array(this.buffer);
        this[_dataStructure] = dataStructure;
        DataBuffer.initDataStructure(dataStructure, this);
        this[_currentStructureIndex] = 0;
        this[_currentByteIndex] = 0;
    }

    _createClass(DataBuffer, [{
        key: 'recycle',
        value: function recycle() {
            return DataBuffer.putInCache(this);
        }
    }, {
        key: 'flush',
        value: function flush(byteLength) {
            if (byteLength != undefined) {
                if (byteLength != this.buffer.byteLength) {
                    this.buffer = new ArrayBuffer(byteLength);
                    this.dv = new DataView(this.buffer);
                    // new Uint8Array(this.buffer);
                    // this.byteDv = new Uint8Array(this.buffer);
                }
            } else {
                var byteDv = new Uint8Array(this.buffer);
                for (var i = 0; i < this.buffer.byteLength; i++) {
                    byteDv[i] = 0.0;
                }
            }
            this[_currentStructureIndex] = 0;
            this[_currentByteIndex] = 0;
        }
    }, {
        key: 'resetButDontFlush',
        value: function resetButDontFlush() {
            this[_currentStructureIndex] = 0;
            this[_currentByteIndex] = 0;
        }
    }, {
        key: 'getByteSize',
        value: function getByteSize(type) {
            switch (type) {
                case TYPE_FLOAT64:
                    return 8;
                case TYPE_UINT8CLAMPED:
                case TYPE_INT8:
                case TYPE_UINT8:
                    return 1;
                case TYPE_INT16:
                case TYPE_UINT16:
                    return 2;
                case TYPE_FLOAT32:
                case TYPE_INT32:
                case TYPE_UINT32:
                    return 4;
            }
            return 0;
        }
    }, {
        key: 'put',
        value: function put(value) {
            if (value instanceof Array) {
                for (var i = 0; i < value.length; i++) {
                    this.put(value[i]);
                }
            } else {
                if (this.dataStructure === undefined) {
                    this.resizeBuffer(4);
                    this.dv.setFloat32(this.currentIndex, value, DataBuffer.littleEndian);
                    this[_currentByteIndex] += this.singleDataFragmentByteSize;
                } else {
                    var structure = this.dataStructure[this[_currentStructureIndex]];
                    var size = this.getByteSize(structure.type);
                    this.resizeBuffer(size);
                    this.setValue(structure.type, value);
                    var k = this.currentIndex % this.singleDataFragmentByteSize;
                    if (k == 0) {
                        this[_currentStructureIndex] = 0;
                        return;
                    }
                    if (k > structure.endByte) {
                        this[_currentStructureIndex]++;
                    }
                }
            }
        }
    }, {
        key: 'get',
        value: function get(offset, type) {
            var littleEndian = DataBuffer.littleEndian;
            switch (type) {
                case TYPE_FLOAT64:
                    return this.dv.getFloat64(offset, littleEndian);
                    break;
                case TYPE_UINT8CLAMPED:
                    return this.dv.getUint8(offset);
                    break;
                case TYPE_INT8:
                    return this.dv.getInt8(offset);
                    break;
                case TYPE_UINT8:
                    return this.dv.getUint8(offset);
                    break;
                case TYPE_INT16:
                    return this.dv.getInt16(offset, littleEndian);
                    break;
                case TYPE_UINT16:
                    return this.dv.getUint16(offset, littleEndian);
                    break;
                case TYPE_FLOAT32:
                    return this.dv.getFloat32(offset, littleEndian);
                    break;
                case TYPE_INT32:
                    return this.dv.getInt32(offset, littleEndian);
                    break;
                case TYPE_UINT32:
                    return this.dv.getUint32(offset, littleEndian);
                    break;
            }
        }
    }, {
        key: 'setValue',
        value: function setValue(type, value) {
            var littleEndian = DataBuffer.littleEndian;
            var index = this.currentIndex;
            switch (type) {
                case TYPE_FLOAT64:
                    this.dv.setFloat64(index, value, littleEndian);
                    this[_currentByteIndex] += 8;
                    break;
                case TYPE_UINT8CLAMPED:
                    this.dv.setUint8(index, value);
                    this[_currentByteIndex] += 1;
                    break;
                case TYPE_INT8:
                    this.dv.setInt8(index, value);
                    this[_currentByteIndex] += 1;
                    break;
                case TYPE_UINT8:
                    this.dv.setUint8(index, value);
                    this[_currentByteIndex] += 1;
                    break;
                case TYPE_INT16:
                    this.dv.setInt16(index, value, littleEndian);
                    this[_currentByteIndex] += 2;
                    break;
                case TYPE_UINT16:
                    this.dv.setUint16(index, value, littleEndian);
                    this[_currentByteIndex] += 2;
                    break;
                case TYPE_FLOAT32:
                    this.dv.setFloat32(index, value, littleEndian);
                    this[_currentByteIndex] += 4;
                    break;
                case TYPE_INT32:
                    this.dv.setInt32(index, value, littleEndian);
                    this[_currentByteIndex] += 4;
                    break;
                case TYPE_UINT32:
                    this.dv.setUint32(index, value, littleEndian);
                    this[_currentByteIndex] += 4;
                    break;
            }
        }
    }, {
        key: 'addLength',
        value: function addLength(additionLength) {
            // ArrayBuffer是不能直接进行读取的，所以利用uint8一个一个字节复制过去,这里用了TypedArray的set方法
            var sourceView = new Uint8Array(this.buffer);
            var destView = new Uint8Array(new ArrayBuffer(this.buffer.byteLength + additionLength));
            destView.set(sourceView);
            this.buffer = destView.buffer;
            this.dv = new DataView(this.buffer);
        }
    }, {
        key: 'resizeBuffer',
        value: function resizeBuffer(additionLength) {
            if (additionLength === undefined) additionLength = this.singleDataFragmentByteSize;
            if (this[_currentByteIndex] + additionLength > this.buffer.byteLength) {
                this.addLength(additionLength);
            }
        }
    }, {
        key: 'clean',
        value: function clean() {
            // 重新new一个出来
            this.buffer = new ArrayBuffer(this.buffer.byteLength);
            this.dv = new DataView(this.buffer);
            this[_currentByteIndex] = 0;
            this[_currentStructureIndex] = 0;
        }
    }, {
        key: 'getVertex',
        value: function getVertex(index) {
            if (index > this.currentIndex || index < 0) throw new Error('Index Error');
            return [this.dv.getFloat32(index), this.dv.getFloat32(index + 4), this.dv.getFloat32(index + 8)];
        }
    }, {
        key: 'modifyVertex',
        value: function modifyVertex(vertex, index) {
            var littleEndian = DataBuffer.littleEndian;
            if (index > this.currentIndex || index < 0) throw new Error('Index Error');
            this.dv.setFloat32(index, vertex[0], littleEndian);
            this.dv.setFloat32(index + 4, vertex[1], littleEndian);
            this.dv.setFloat32(index + 8, vertex[2], littleEndian);
        }
    }, {
        key: 'putVertexData',
        value: function putVertexData(vertex, color, opacity, texcoord) {
            this.putVertexData2(vertex[0], vertex[1], vertex[2], color, opacity, texcoord);
        }
    }, {
        key: 'putVertexData2',
        value: function putVertexData2(x, y, z, color, opacity, texcoord) {
            this.resizeBuffer(this.singleDataFragmentByteSize);
            var littleEndian = DataBuffer.littleEndian;
            var index = this.currentIndex;
            this.dv.setFloat32(index, x, littleEndian);
            this.dv.setFloat32(index + 4, y, littleEndian);
            this.dv.setFloat32(index + 8, z, littleEndian);
            // this.dv.setFloat32(index + 12, trasnformMatrixIndex, littleEndian);
            // 这里插入1位float类型的无用数据，为了数据对齐
            this.dv.setFloat32(index + 16, 0, littleEndian);
            // 再继续添加顶点数据
            this.dv.setUint8(index + 20, color[0]);
            this.dv.setUint8(index + 21, color[1]);
            this.dv.setUint8(index + 22, color[2]);
            this.dv.setUint8(index + 23, Math.floor(opacity * 100));
            this.dv.setFloat32(index + 24, texcoord[0], littleEndian);
            this.dv.setFloat32(index + 28, texcoord[1], littleEndian);

            this[_currentByteIndex] += this.singleDataFragmentByteSize;
        }
    }, {
        key: 'dataStructure',
        get: function get() {
            return this[_dataStructure];
        }
    }, {
        key: 'currentIndex',
        get: function get() {
            return this[_currentByteIndex];
        }
    }, {
        key: 'bufferByteLength',
        get: function get() {
            return this.buffer.byteLength;
        }
    }, {
        key: 'singleDataFragmentByteSize',
        get: function get() {
            return this[_singleDataFragmentSize];
        }
    }, {
        key: 'vertexCount',
        get: function get() {
            return this.currentIndex / this.singleDataFragmentByteSize;
        }
    }, {
        key: 'length',
        get: function get() {
            return this.buffer.byteLength;
        }
    }], [{
        key: 'putInCache',
        value: function putInCache(dataBuffer) {
            var buffer = dataBuffer.buffer;
            var dv = dataBuffer.dv;
            if (currentCacheSize + buffer.byteLength > cacheMaxsize) {
                return false;
            } else {
                currentCacheSize += buffer.byteLength;
                var array = arrayBufferCache[buffer.byteLength];
                if (array == undefined) {
                    array = [];
                    arrayBufferCache[buffer.byteLength] = array;
                }
                array.push({ buffer: buffer, dv: dv });
            }
            return true;
        }
    }, {
        key: 'getFromCache',
        value: function getFromCache(length) {
            var array = arrayBufferCache[length];
            if (array == undefined || array.length == 0) return null;
            var cacheBuffer = array.pop();
            currentCacheSize -= cacheBuffer.buffer.byteLength;
            return cacheBuffer;
        }
    }, {
        key: 'initDataStructure',
        value: function initDataStructure(dataStructure, that) {
            if (dataStructure === undefined || dataStructure === null) {
                // 如果没有设置数据结构，那就默认是单个float32进行添加
                console.warn("DataStructure没有指定，默认单个float32数据进行存放。DataStructure必须是一个数组，其内部结构为 [...{type:type,count:count,byteSize:size},...]");
                that[_singleDataFragmentSize] = 4;
                that[_dataStructure] = undefined;
                return;
            } else {
                if (!(dataStructure instanceof Array)) {
                    console.warn("DataStructure必须是一个数组，其内部结构为 [...{type:type,count:count,byteSize:size},...]");
                    that[_singleDataFragmentSize] = 4;
                    that[_dataStructure] = undefined;
                    return;
                }
                var size = 0;
                var startByte = 0;
                var endByte = 0;
                for (var i = 0; i < dataStructure.length; i++) {
                    var s = dataStructure[i];
                    s.byteSize = that.getByteSize(s.type) * s.count;
                    s.startByte = startByte;
                    endByte = startByte + s.byteSize;
                    s.endByte = endByte - 1;
                    size += s.byteSize;
                    startByte = endByte;
                }
                that[_singleDataFragmentSize] = size;
            }
        }
    }, {
        key: 'arrayBufferCache',
        get: function get() {
            return arrayBufferCache;
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
    }, {
        key: 'littleEndian',
        get: function get() {
            if (littleEndian === undefined) {
                // DataView是默认按照高位存放，这里要做判断，更改存放顺序
                // PS: Float32Array却是按照低位存放的
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

    return DataBuffer;
}();

exports.default = DataBuffer;