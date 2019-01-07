"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _VertexData = require("./VertexData.js");

var _VertexData2 = _interopRequireDefault(_VertexData);

var _EarClipping = require("../geometry/EarClipping.js");

var _EarClipping2 = _interopRequireDefault(_EarClipping);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ACTION_STROKE = 0; // stroke动作
var ACTION_FILL = 1; // fill动作

var RenderAction = function () {
    function RenderAction(type) {
        _classCallCheck(this, RenderAction);

        this.type = type;
        this.vertexData = null;
        this.textureIndex = -1;
    }

    _createClass(RenderAction, [{
        key: "getVertexData",
        value: function getVertexData(vertexNumber) {
            if (this.vertexData == null) {
                this.vertexData = new _VertexData2.default(this.type, vertexNumber);
            } else {
                this.vertexData.resize(vertexNumber);
            }
            return this.vertexData;
        }
    }, {
        key: "collectVertexData",
        value: function collectVertexData(pathList, color, opacity, textureCoord) {
            if (this.type == ACTION_FILL) {
                this.collectVertexDataForFill(pathList, color, opacity, textureCoord);
                return;
            }
            if (this.type == ACTION_STROKE) {
                this.collectVertexDataForStroke(pathList, color, opacity, textureCoord);
                return;
            }
        }
    }, {
        key: "collectVertexDataForStroke",
        value: function collectVertexDataForStroke(pathList, color, opacity, textureCoord) {
            for (var i = 0; i < pathList.length; i++) {
                var path = pathList[i];
                for (var j = 0; j < path.subPathNumber; j++) {
                    var subPath = path.subPathArray[j];
                    var vertexCount = subPath.pointsNumber;
                    if (vertexCount < 2) continue;
                    if (subPath.isClosed) vertexCount++;
                    var vertexData = this.getVertexData(vertexCount);
                    for (var _i = 0; _i < vertexCount; _i++) {
                        var index = _i % subPath.pointsNumber;
                        vertexData.addMatrixIdData(subPath.getPoint(index).matrixIdData);
                        vertexData.addVertexData(subPath.getPoint(index).value, color, opacity, textureCoord);
                    }
                }
            }
        }
    }, {
        key: "collectVertexDataForFill",
        value: function collectVertexDataForFill(pathList, color, opacity, textureCoord) {
            for (var i = 0; i < pathList.length; i++) {
                var path = pathList[i];
                if (path.subPathNumber == 0) {
                    continue;
                }
                for (var j = 0; j < path.subPathNumber; j++) {
                    var subPath = path.subPathArray[j];
                    if (subPath.pointsNumber < 3) continue; // 小于三个无法填充成一个面
                    this.organizeVertexForFill(subPath, color, opacity, textureCoord);
                }
            }
        }
    }, {
        key: "organizeVertexForFill",
        value: function organizeVertexForFill(subPath, color, opacity, textureCoord) {
            var temp = new Array(subPath.pointsNumber * 2);
            for (var i = 0; i < subPath.pointsNumber; i++) {
                var p = subPath.getPoint(i);
                var index = i * 2;
                temp[index] = p.x;
                temp[index + 1] = p.y;
            }
            var vertexOrg = _EarClipping2.default.earcut(temp);
            var vertexData = this.getVertexData(vertexOrg.length);
            for (var _i2 = 0; _i2 < vertexOrg.length; _i2++) {
                var vertexIndex = vertexOrg[_i2];
                vertexData.addMatrixIdData(subPath.getPoint(vertexIndex).matrixIdData);
                if (textureCoord[0] instanceof Array) {
                    vertexData.addVertexData(subPath.getPoint(vertexIndex).value, color, opacity, textureCoord[vertexIndex]);
                } else {
                    vertexData.addVertexData(subPath.getPoint(vertexIndex).value, color, opacity, textureCoord);
                }
            }
        }
    }], [{
        key: "ACTION_STROKE",
        get: function get() {
            return ACTION_STROKE;
        }
    }, {
        key: "ACTION_FILL",
        get: function get() {
            return ACTION_FILL;
        }
    }]);

    return RenderAction;
}();

exports.default = RenderAction;