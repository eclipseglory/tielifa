"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DataBuffer = require("./DataBuffer.js");

var _DataBuffer2 = _interopRequireDefault(_DataBuffer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// 这里每个节点大小如下：
// 1. 三位是坐标，float类型，共3*4 , 12字节
// 2. 两位是贴图坐标，float类型，共2*4 , 8个字节
// 3. 四位颜色坐标, unsigleint类型，共4个字节
// 4. 有两位float类型，是空的，只是为了让整个数据块成为16的倍数,这不是强迫症，而是叫做数据对齐
var VERTEX_DATA_STRUCTURE = [{ type: _DataBuffer2.default.TYPE_FLOAT32, count: 3 }, { type: _DataBuffer2.default.TYPE_FLOAT32, count: 2 }, { type: _DataBuffer2.default.TYPE_UINT8, count: 4 }, { type: _DataBuffer2.default.TYPE_FLOAT32, count: 2 }];
var VERTEX_BYTE_LENGTH = 32;

var MATRIX_INDEX_STRUCTURE = [{ type: _DataBuffer2.default.TYPE_FLOAT32, count: 1 }];
var MATRIX_INDEX_BYTE_LENGTH = 4;

var TYPE_FILL = 0;
var TYPE_STROKE = 1;

var VertexData = function () {
    function VertexData(type, vertexNum) {
        _classCallCheck(this, VertexData);

        this.type = type;
        this.dataBuffer = new _DataBuffer2.default(VERTEX_DATA_STRUCTURE, vertexNum * VERTEX_BYTE_LENGTH);
        // 因为attribute不允许int类型，只有用float代替了
        this.matrixIndexBuffer = new _DataBuffer2.default(MATRIX_INDEX_STRUCTURE, vertexNum * MATRIX_INDEX_BYTE_LENGTH);
        // this.matrixIdBuffer = new DataBuffer(MATRIX_ID_STRUCTURE, vertexNum * MATRIX_ID_BYTE_LENGTH);
        this.matrixIdArray = [];
    }

    _createClass(VertexData, [{
        key: "resize",
        value: function resize(vertexNum) {
            this.dataBuffer.addLength(vertexNum * VERTEX_BYTE_LENGTH);
            this.matrixIndexBuffer.addLength(vertexNum * MATRIX_INDEX_BYTE_LENGTH);
            // this.matrixIdBuffer.addLength(vertexNum * MATRIX_ID_BYTE_LENGTH);
        }
    }, {
        key: "addVertexData",
        value: function addVertexData(points, color, opacity, textureCoor) {
            this.addVertexData2(points[0], points[1], points[2], color, opacity, textureCoor);
            // this.matrixIndexBuffer.put(transformMatrixId);
        }
    }, {
        key: "addVertexData2",
        value: function addVertexData2(x, y, z, color, opacity, textureCoor) {
            this.dataBuffer.putVertexData2(x, y, z, color, opacity, textureCoor);
        }
    }, {
        key: "addMatrixIdData",
        value: function addMatrixIdData(data) {
            this.matrixIdArray.push(data);
        }
    }, {
        key: "getMatrixIdData",
        value: function getMatrixIdData(vertexIndex) {
            return this.matrixIdArray[vertexIndex];
        }
    }, {
        key: "getContextStateIndex",
        value: function getContextStateIndex(vertexIndex) {
            return this.matrixIdArray[vertexIndex][0];
        }
    }, {
        key: "getMatrixIndex",
        value: function getMatrixIndex(vertexIndex) {
            return this.matrixIdArray[vertexIndex][1];
        }
    }, {
        key: "putMatrixId",
        value: function putMatrixId(id) {
            this.matrixIndexBuffer.put(id);
        }
    }, {
        key: "vertexNumber",
        get: function get() {
            return this.bufferSize / VERTEX_BYTE_LENGTH;
        }
    }, {
        key: "bufferSize",
        get: function get() {
            return this.dataBuffer.currentIndex;
        }
    }], [{
        key: "VERTEX_BYTE_SIZE",
        get: function get() {
            return VERTEX_BYTE_LENGTH;
        }
    }, {
        key: "TYPE_FILL",
        get: function get() {
            return TYPE_FILL;
        }
    }, {
        key: "TYPE_STROKE",
        get: function get() {
            return TYPE_STROKE;
        }
    }]);

    return VertexData;
}();

exports.default = VertexData;