"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseBufferData2 = require("./BaseBufferData.js");

var _BaseBufferData3 = _interopRequireDefault(_BaseBufferData2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SINGLE_DATA_BYTE_LENGTH = 4;

var TransformMatrixData = function (_BaseBufferData) {
    _inherits(TransformMatrixData, _BaseBufferData);

    function TransformMatrixData(verticesNum) {
        _classCallCheck(this, TransformMatrixData);

        // 1位是float32类型，矩阵索引
        return _possibleConstructorReturn(this, (TransformMatrixData.__proto__ || Object.getPrototypeOf(TransformMatrixData)).call(this, verticesNum, SINGLE_DATA_BYTE_LENGTH));
    }

    _createClass(TransformMatrixData, [{
        key: "setMatrixIndex",
        value: function setMatrixIndex(mIndex, index) {
            this.setData(mIndex, index);
        }
    }, {
        key: "addMatrixIndex",
        value: function addMatrixIndex(mIndex) {
            var index = this.currentIndex;
            if (index * this.singleDataByteLength >= this.totalByteLength) {
                this.resize(this.totalByteLength * 2);
            }
            this.setMatrixIndex(mIndex, index);
            this.currentIndex++;
        }
    }, {
        key: "getMatrixIndex",
        value: function getMatrixIndex(index) {
            return this.getData(index);
        }
    }]);

    return TransformMatrixData;
}(_BaseBufferData3.default);

exports.default = TransformMatrixData;