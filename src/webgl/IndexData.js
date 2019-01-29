'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _currentIndex = Symbol('当前顶点游标位置');
var _dataArray = Symbol('Int16的typed数组');
var _arrayBuffer = Symbol('存储顶点数组的buffer');
var SINGLE_DATA_BYTE_LENGTH = 2;

var IndexData = function () {
    function IndexData(maxVertexNumber) {
        _classCallCheck(this, IndexData);

        this[_arrayBuffer] = new ArrayBuffer(maxVertexNumber * 2);
        this[_dataArray] = new Uint16Array(this[_arrayBuffer]);
        this[_currentIndex] = 0;
    }

    _createClass(IndexData, [{
        key: 'init',
        value: function init() {
            this[_currentIndex] = 0;
        }
    }, {
        key: 'setIndex',
        value: function setIndex(indexData, index) {
            if (index * 2 >= this.totalByteLength) {
                this.resize(this.totalByteLength * 2);
            }
            this[_dataArray][index] = indexData;
        }
    }, {
        key: 'getIndex',
        value: function getIndex(index) {
            return this[_dataArray][index];
        }
    }, {
        key: 'addIndex',
        value: function addIndex(indexData) {
            var index = this[_currentIndex];
            this.setIndex(indexData, index);
            this[_currentIndex]++;
        }
    }, {
        key: 'resize',
        value: function resize(length) {
            if (length < this.totalByteLength) throw Error('new length should not less than old length');
            var oldBuffer = this[_arrayBuffer];
            this[_arrayBuffer] = new ArrayBuffer(length);
            var dv1 = new Uint8Array(oldBuffer);
            var ndv = new Uint8Array(this[_arrayBuffer]);
            ndv.set(dv1, 0);
            this[_dataArray] = new Uint16Array(this[_arrayBuffer]);
        }
    }, {
        key: 'dataArray',
        get: function get() {
            return this[_dataArray];
        }
    }, {
        key: 'singleDataByteLength',
        get: function get() {
            return SINGLE_DATA_BYTE_LENGTH;
        }
    }, {
        key: 'totalByteLength',
        get: function get() {
            return this[_arrayBuffer].byteLength;
        }
    }, {
        key: 'buffer',
        get: function get() {
            return this[_arrayBuffer];
        }
    }, {
        key: 'currentIndex',
        get: function get() {
            return this[_currentIndex];
        }
    }]);

    return IndexData;
}();

exports.default = IndexData;