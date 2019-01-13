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
            var totalLineCount = 0;
            for (var i = 0; i < pathList.length; i++) {
                var path = pathList[i];
                for (var j = 0; j < path.subPathNumber; j++) {
                    var subPath = path.subPathArray[j];
                    var vertexCount = subPath.pointsNumber;
                    if (vertexCount < 2) continue;
                    var lc = vertexCount - 1;
                    if (subPath.isClosed) lc++;
                    totalLineCount += lc;
                }
            }
            var vertexData = this.getVertexData(totalLineCount * 2);

            for (var _i = 0; _i < pathList.length; _i++) {
                var _path = pathList[_i];
                for (var _j = 0; _j < _path.subPathNumber; _j++) {
                    var _subPath = _path.subPathArray[_j];
                    var _vertexCount = _subPath.pointsNumber;
                    if (_vertexCount < 2) continue;
                    var lineCount = _vertexCount - 1;
                    if (_subPath.isClosed) lineCount++;
                    for (var _i2 = 0; _i2 < lineCount; _i2++) {
                        var index = _i2;
                        vertexData.addMatrixIdData(_subPath.getPointMatrixData(index));
                        vertexData.addVertexData2(_subPath.getPointX(index), _subPath.getPointY(index), _subPath.getPointZ(index), color, opacity, textureCoord);
                        var nextIndex = (_i2 + 1) % _vertexCount;
                        vertexData.addMatrixIdData(_subPath.getPointMatrixData(nextIndex));
                        vertexData.addVertexData2(_subPath.getPointX(nextIndex), _subPath.getPointY(nextIndex), _subPath.getPointZ(nextIndex), color, opacity, textureCoord);
                    }
                }
            }
        }
    }, {
        key: "collectVertexDataForFill",
        value: function collectVertexDataForFill(pathList, color, opacity, textureCoord) {
            var totalNum = 0;
            var orgedVertexed = [];
            for (var i = 0; i < pathList.length; i++) {
                var path = pathList[i];
                if (path.subPathNumber == 0) {
                    continue;
                }
                for (var j = 0; j < path.subPathNumber; j++) {
                    var subPath = path.subPathArray[j];
                    if (subPath.pointsNumber < 3) continue; // 小于三个无法填充成一个面
                    var vertexOrg = void 0;
                    var pointArray = subPath.pointsCoordinateArray;
                    var pointsNumber = subPath.pointsNumber;
                    if (pointsNumber * 3 == pointArray.length) {
                        vertexOrg = _EarClipping2.default.earcut(pointArray, null, 3);
                    } else {
                        var temp = pointArray.slice(0, pointsNumber * 3);
                        vertexOrg = _EarClipping2.default.earcut(temp, null, 3);
                    }
                    totalNum += vertexOrg.length;
                    orgedVertexed.push(vertexOrg);
                    // this.organizeVertexForFill(subPath, color, opacity, textureCoord)
                }
            }

            var vertexData = this.getVertexData(totalNum);
            if (totalNum == 0) {
                return;
            }
            var index = 0;
            for (var _i3 = 0; _i3 < pathList.length; _i3++) {
                var _path2 = pathList[_i3];
                if (_path2.subPathNumber == 0) {
                    continue;
                }
                for (var _j2 = 0; _j2 < _path2.subPathNumber; _j2++, index++) {
                    var _subPath2 = _path2.subPathArray[_j2];
                    if (_subPath2.pointsNumber < 3) continue; // 小于三个无法填充成一个面
                    var _vertexOrg = orgedVertexed[index];
                    for (var k = 0; k < _vertexOrg.length; k++) {
                        var vertexIndex = _vertexOrg[k];
                        vertexData.addMatrixIdData(_subPath2.getPointMatrixData(vertexIndex));
                        if (textureCoord[0] instanceof Array) {
                            vertexData.addVertexData2(_subPath2.getPointX(vertexIndex), _subPath2.getPointY(vertexIndex), _subPath2.getPointZ(vertexIndex), color, opacity, textureCoord[vertexIndex]);
                        } else {
                            vertexData.addVertexData2(_subPath2.getPointX(vertexIndex), _subPath2.getPointY(vertexIndex), _subPath2.getPointZ(vertexIndex), color, opacity, textureCoord);
                        }
                    }
                }
            }
        }

        /**
         * @deprecated
         * @param subPath
         * @param color
         * @param opacity
         * @param textureCoord
         */

    }, {
        key: "organizeVertexForFill",
        value: function organizeVertexForFill(subPath, color, opacity, textureCoord) {
            var vertexOrg = void 0;
            var pointArray = subPath.pointsCoordinateArray;
            var pointsNumber = subPath.pointsNumber;
            if (pointsNumber * 3 == pointArray.length) {
                vertexOrg = _EarClipping2.default.earcut(pointArray, null, 3);
            } else {
                var temp = pointArray.slice(0, pointsNumber * 3);
                vertexOrg = _EarClipping2.default.earcut(temp, null, 3);
            }
            var vertexData = this.getVertexData(vertexOrg.length);
            for (var i = 0; i < vertexOrg.length; i++) {
                var vertexIndex = vertexOrg[i];
                vertexData.addMatrixIdData(subPath.getPointMatrixData(vertexIndex));
                if (textureCoord[0] instanceof Array) {
                    vertexData.addVertexData2(subPath.getPointX(vertexIndex), subPath.getPointY(vertexIndex), subPath.getPointZ(vertexIndex), color, opacity, textureCoord[vertexIndex]);
                } else {
                    vertexData.addVertexData2(subPath.getPointX(vertexIndex), subPath.getPointY(vertexIndex), subPath.getPointZ(vertexIndex), color, opacity, textureCoord);
                }
            }
            // let temp = new Array(subPath.pointsNumber * 2);
            // for (let i = 0; i < subPath.pointsNumber; i++) {
            //     let p = subPath.getPoint(i);
            //     let index = i * 2;
            //     temp[index] = p.x;
            //     temp[index + 1] = p.y;
            // }
            // let vertexOrg = EarClipping.earcut(temp);
            // let vertexData = this.getVertexData(vertexOrg.length);
            // for (let i = 0; i < vertexOrg.length; i++) {
            //     let vertexIndex = vertexOrg[i];
            //     vertexData.addMatrixIdData(subPath.getPoint(vertexIndex).matrixIdData);
            //     if (textureCoord[0] instanceof Array) {
            //         vertexData.addVertexData(subPath.getPoint(vertexIndex).value, color, opacity, textureCoord[vertexIndex]);
            //     } else {
            //         vertexData.addVertexData(subPath.getPoint(vertexIndex).value, color, opacity, textureCoord);
            //     }
            // }
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