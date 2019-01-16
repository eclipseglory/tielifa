'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _currentIndex = Symbol('当前顶点游标位置');
var _dataArray = Symbol('Float32的typed数组');
var _arrayBuffer = Symbol('存储顶点数组的buffer');
var SINGLE_DATA_BYTE_LENGTH = 32;

var VerticesData = function () {
    function VerticesData(verticesNum) {
        _classCallCheck(this, VerticesData);

        this[_arrayBuffer] = new ArrayBuffer(verticesNum * 4 * 2 * 4);
        this[_dataArray] = new Float32Array(this[_arrayBuffer]);
        this[_currentIndex] = 0;
    }

    _createClass(VerticesData, [{
        key: 'init',
        value: function init() {
            this[_currentIndex] = 0;
        }
    }, {
        key: 'setVerticesData',
        value: function setVerticesData(x, y, z, nx, ny, nz, index) {
            index = index * 8;
            if (index * 4 >= this.totalByteLength) {
                this.resize(this.totalByteLength * 2);
            }
            this[_dataArray][index] = x;
            this[_dataArray][index + 1] = y;
            this[_dataArray][index + 2] = z;

            this[_dataArray][index + 4] = nx;
            this[_dataArray][index + 5] = ny;
            this[_dataArray][index + 6] = nz;
        }
    }, {
        key: 'getVerticesData',
        value: function getVerticesData(index) {
            index = index * 8;
            var x = this[_dataArray][index];
            var y = this[_dataArray][index + 1];
            var z = this[_dataArray][index + 2];

            var nx = this[_dataArray][index + 4];
            var ny = this[_dataArray][index + 5];
            var nz = this[_dataArray][index + 6];

            return [x, y, z, nx, ny, nz];
        }
    }, {
        key: 'getVerticesPositionData',
        value: function getVerticesPositionData(index) {
            index = index * 8;
            var x = this[_dataArray][index];
            var y = this[_dataArray][index + 1];
            var z = this[_dataArray][index + 2];
            return [x, y, z];
        }
    }, {
        key: 'getVerticesNormalData',
        value: function getVerticesNormalData(index) {
            index = index * 8;
            var nx = this[_dataArray][index + 4];
            var ny = this[_dataArray][index + 5];
            var nz = this[_dataArray][index + 6];
            return [nx, ny, nz];
        }
    }, {
        key: 'addVerticesData',
        value: function addVerticesData(x, y, z, nx, ny, nz) {
            var index = this[_currentIndex];
            this.setVerticesData(x, y, z, nx, ny, nz, index);
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
            this[_dataArray] = new Float32Array(this[_arrayBuffer]);
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

    return VerticesData;
}();

exports.default = VerticesData;