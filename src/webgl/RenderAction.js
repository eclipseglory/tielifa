"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EarClipping = require("../geometry/EarClipping.js");

var _EarClipping2 = _interopRequireDefault(_EarClipping);

var _LineToRectangle = require("../geometry/LineToRectangle.js");

var _LineToRectangle2 = _interopRequireDefault(_LineToRectangle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ACTION_STROKE = 0; // stroke动作
var ACTION_FILL = 1; // fill动作

var RenderAction = function () {
    function RenderAction(type) {
        _classCallCheck(this, RenderAction);

        this.type = type;
        this.textureIndex = -1;
        this.verticesData = null;
        this.fragmentData = null;
        this.transformData = null;
        this.renderPointNumber = 0;
    }

    _createClass(RenderAction, [{
        key: "collectVertexDataForStroke",
        value: function collectVertexDataForStroke(pathList, color, opacity, textureCoord, lineWidth, faceDirection) {

            var totalPointsCount = 0;
            var linesRects = [];
            var lineToRect = new _LineToRectangle2.default(lineWidth);
            if (faceDirection != undefined) {
                lineToRect.faceDirection.x = faceDirection[0];
                lineToRect.faceDirection.y = faceDirection[1];
                lineToRect.faceDirection.z = faceDirection[2];
            }
            for (var i = 0; i < pathList.length; i++) {
                var path = pathList[i];
                for (var j = 0; j < path.subPathNumber; j++) {
                    var subPath = path.subPathArray[j];
                    var vertexCount = subPath.pointsNumber;
                    if (vertexCount < 2) continue;
                    lineToRect.points = subPath.pointsCoordinateArray;
                    lineToRect.isClosed = subPath.isClosed;
                    var result = lineToRect.generatePoints();
                    totalPointsCount += result.length / 3;
                    linesRects.push(result);
                }
            }
            this.renderPointNumber += totalPointsCount;
            if (totalPointsCount == 0) return;
            // let vertexData = this.getVertexData(totalPointsCount);
            var testData = this.verticesData;
            for (var _i = 0; _i < linesRects.length; _i++) {
                var rects = linesRects[_i];
                for (var _j = 0; _j < rects.length / 3; _j++) {
                    var index = _j * 3;
                    // vertexData.addVertexData2(rects[index], rects[index + 1], rects[index + 2],
                    //     color, opacity, textureCoord);
                    if (testData != null) {
                        testData.addVerticesData(rects[index], rects[index + 1], rects[index + 2], faceDirection[0], faceDirection[1], faceDirection[2]);
                    }
                    if (this.fragmentData != null) {
                        this.fragmentData.addFragmentData(color[0], color[1], color[2], opacity, textureCoord[0], textureCoord[1], -1);
                    }
                    if (this.transformData != null) {
                        // 记录转换矩阵数据
                        this.transformData.addMatrixIndex(0);
                    }
                }
            }
        }
    }, {
        key: "collectVertexDataForFill",
        value: function collectVertexDataForFill(pathList, color, opacity, textureCoord, faceDirection) {
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
                    if (pointsNumber == 3) {
                        vertexOrg = [0, 1, 2];
                    } else {
                        if (pointsNumber * 3 == pointArray.length) {
                            vertexOrg = _EarClipping2.default.earcut(pointArray, null, 3);
                        } else {
                            var temp = pointArray.slice(0, pointsNumber * 3);
                            vertexOrg = _EarClipping2.default.earcut(temp, null, 3);
                        }
                    }
                    totalNum += vertexOrg.length;
                    orgedVertexed.push(vertexOrg);
                    // this.organizeVertexForFill(subPath, color, opacity, textureCoord)
                }
            }
            this.renderPointNumber += totalNum;
            // let vertexData = this.getVertexData(totalNum);
            if (totalNum == 0) {
                return;
            }
            var index = 0;
            var testVertiesData = this.verticesData;
            for (var _i2 = 0; _i2 < pathList.length; _i2++) {
                var _path = pathList[_i2];
                if (_path.subPathNumber == 0) {
                    continue;
                }
                for (var _j2 = 0; _j2 < _path.subPathNumber; _j2++, index++) {
                    var _subPath = _path.subPathArray[_j2];
                    if (_subPath.pointsNumber < 3) continue; // 小于三个无法填充成一个面
                    var _vertexOrg = orgedVertexed[index];
                    for (var k = 0; k < _vertexOrg.length; k++) {
                        var vertexIndex = _vertexOrg[k];
                        if (testVertiesData != null) {
                            testVertiesData.addVerticesData(_subPath.getPointX(vertexIndex), _subPath.getPointY(vertexIndex), _subPath.getPointZ(vertexIndex), faceDirection[0], faceDirection[1], faceDirection[2]);
                        }
                        if (this.fragmentData != null) {
                            var t = undefined;
                            if (textureCoord[0] instanceof Array) {
                                t = textureCoord[vertexIndex];
                            } else {
                                t = textureCoord;
                            }
                            this.fragmentData.addFragmentData(color[0], color[1], color[2], opacity, t[0], t[1], this.textureIndex);
                        }
                        if (this.transformData != null) {
                            // 记录转换矩阵数据
                            this.transformData.addMatrixIndex(0);
                        }
                    }
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