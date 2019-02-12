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
        this.indexData = null;
        this.applyMatrix = null;
        this.applyColor = null;
        this.applyOpacity = null;
    }

    _createClass(RenderAction, [{
        key: "collectVertexDataForStroke",
        value: function collectVertexDataForStroke(pathList, color, opacity, textureCoord, lineWidth, faceDirection) {
            var that = this;
            var pointArrayInterface = {
                setPoint: function setPoint(p, index) {
                    that.verticesData.setVerticesCoor(p.x, p.y, p.z, index + pointArrayInterface.offset);
                },
                addPoint: function addPoint(p) {
                    if (that.verticesData != null) {
                        that.verticesData.addVerticesData(p.x, p.y, p.z, faceDirection[0], faceDirection[1], faceDirection[2]);
                    }
                    if (that.fragmentData != null) {
                        that.fragmentData.addFragmentData(color[0], color[1], color[2], opacity, textureCoord[0], textureCoord[1], -1);
                    }
                    if (that.transformData != null) {
                        // 记录转换矩阵数据
                        that.transformData.addMatrixIndex(0);
                    }
                }
            };
            for (var i = 0; i < pathList.length; i++) {
                var path = pathList[i];
                for (var j = 0; j < path.subPathNumber; j++) {
                    var subPath = path.subPathArray[j];
                    var vertexCount = subPath.pointsNumber;
                    if (vertexCount < 2) continue;
                    pointArrayInterface.offset = this.verticesData.currentIndex;
                    var lineNum = _LineToRectangle2.default.generatePoints1(lineWidth, subPath.pointsCoordinateArray, subPath.isClosed, faceDirection, pointArrayInterface);
                    for (var k = 0; k < lineNum; k++) {
                        var index = k * 4;
                        this.indexData.addIndex(pointArrayInterface.offset + index);
                        this.indexData.addIndex(pointArrayInterface.offset + index + 1);
                        this.indexData.addIndex(pointArrayInterface.offset + index + 2);

                        this.indexData.addIndex(pointArrayInterface.offset + index + 2);
                        this.indexData.addIndex(pointArrayInterface.offset + index + 3);
                        this.indexData.addIndex(pointArrayInterface.offset + index);
                    }
                    this.renderPointNumber += lineNum * 6;
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
                                var _temp = pointArray.slice(0, pointsNumber * 3);
                                vertexOrg = _EarClipping2.default.earcut(_temp, null, 3);
                            }
                        }
                    }
                    this.renderPointNumber += vertexOrg.length;
                    var offset = this.verticesData.currentIndex;
                    var k = void 0;
                    for (k = 0; k < pointsNumber; k++) {
                        if (this.verticesData != null) {
                            this.verticesData.addVerticesData(subPath.getPointX(k), subPath.getPointY(k), subPath.getPointZ(k), faceDirection[0], faceDirection[1], faceDirection[2]);
                        }
                        if (this.fragmentData != null) {
                            var t = undefined;
                            if (textureCoord[0] instanceof Array) {
                                t = textureCoord[k];
                            } else {
                                t = textureCoord;
                            }
                            this.fragmentData.addFragmentData(color[0], color[1], color[2], opacity, t[0], t[1], this.textureIndex);
                        }
                        if (this.transformData != null) {
                            // 记录转换矩阵数据
                            this.transformData.addMatrixIndex(0);
                        }
                        var vertexIndex = vertexOrg[k];
                        this.indexData.addIndex(vertexIndex + offset);
                    }

                    var temp = k;
                    for (var _k = temp; _k < vertexOrg.length; _k++) {
                        var _vertexIndex = vertexOrg[_k];
                        this.indexData.addIndex(_vertexIndex + offset);
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