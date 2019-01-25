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

var TRIANGLE_ORG = [0, 1, 2];
var RECT_ORG = [0, 1, 2, 2, 3, 0];

var RenderAction = function () {
    function RenderAction(type) {
        _classCallCheck(this, RenderAction);

        this.type = type;
        this.textureIndex = -1;
        this.verticesData = null;
        this.fragmentData = null;
        this.transformData = null;
        this.renderPointNumber = 0;
        this.isRect = false;
    }

    _createClass(RenderAction, [{
        key: "collectVertexDataForStroke",
        value: function collectVertexDataForStroke(pathList, color, opacity, textureCoord, lineWidth, faceDirection) {
            for (var i = 0; i < pathList.length; i++) {
                var path = pathList[i];
                for (var j = 0; j < path.subPathNumber; j++) {
                    var subPath = path.subPathArray[j];
                    var vertexCount = subPath.pointsNumber;
                    if (vertexCount < 2) continue;

                    var rects = _LineToRectangle2.default.generatePoints1(lineWidth, subPath.pointsCoordinateArray, subPath.isClosed, faceDirection);
                    var pointsNum = rects.length / 3;
                    for (var k = 0; k < pointsNum; k++) {
                        var index = k * 3;
                        if (this.verticesData != null) {
                            this.verticesData.addVerticesData(rects[index], rects[index + 1], rects[index + 2], faceDirection[0], faceDirection[1], faceDirection[2]);
                        }
                        if (this.fragmentData != null) {
                            this.fragmentData.addFragmentData(color[0], color[1], color[2], opacity, textureCoord[0], textureCoord[1], -1);
                        }
                        if (this.transformData != null) {
                            // 记录转换矩阵数据
                            this.transformData.addMatrixIndex(0);
                        }
                    }
                    this.renderPointNumber += pointsNum;
                }
            }
        }
    }, {
        key: "collectVertexDataForFill",
        value: function collectVertexDataForFill(pathList, color, opacity, textureCoord, faceDirection) {
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
                        vertexOrg = TRIANGLE_ORG;
                    } else {
                        if (pointsNumber == 4 && subPath.isRegularRect) {
                            vertexOrg = RECT_ORG;
                        } else {
                            if (pointsNumber * 3 == pointArray.length) {
                                vertexOrg = _EarClipping2.default.earcut(pointArray, null, 3);
                            } else {
                                var temp = pointArray.slice(0, pointsNumber * 3);
                                vertexOrg = _EarClipping2.default.earcut(temp, null, 3);
                            }
                        }
                    }
                    this.renderPointNumber += vertexOrg.length;

                    for (var k = 0; k < vertexOrg.length; k++) {
                        var vertexIndex = vertexOrg[k];
                        if (this.verticesData != null) {
                            this.verticesData.addVerticesData(subPath.getPointX(vertexIndex), subPath.getPointY(vertexIndex), subPath.getPointZ(vertexIndex), faceDirection[0], faceDirection[1], faceDirection[2]);
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