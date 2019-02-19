import EarClipping from "../geometry/EarClipping.js";
import LineToRectangle from "../geometry/LineToRectangle.js";

const ACTION_STROKE = 0; // stroke动作
const ACTION_FILL = 1; // fill动作

const TRIANGLE_ORG = [0, 1, 2];
const RECT_ORG = [0, 1, 2, 2, 3, 0];
export default class RenderAction {
    constructor(type) {
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

    static get ACTION_STROKE() {
        return ACTION_STROKE;
    }

    static get ACTION_FILL() {
        return ACTION_FILL;
    }

    collectVertexDataForStroke(pathList, color, opacity, textureCoord, lineWidth, filterType, faceDirection) {
        let that = this;
        let outputInterface = {
            setPoint: function (p, index) {
                that.verticesData.setVerticesCoor(p.x, p.y, p.z, index + outputInterface.offset);
            },
            addPoint: function (p) {
                if (that.verticesData != null) {
                    that.verticesData.addVerticesData(p.x, p.y, p.z, faceDirection[0], faceDirection[1], faceDirection[2]);
                }
                if (that.fragmentData != null) {
                    that.fragmentData.addFragmentData(color[0], color[1], color[2], opacity, textureCoord[0], textureCoord[1], -1, filterType);
                }
                if (that.transformData != null) {
                    // 记录转换矩阵数据
                    that.transformData.addMatrixIndex(0);
                }
            }
        };

        for (let i = 0; i < pathList.length; i++) {
            let path = pathList[i];
            for (let j = 0; j < path.subPathNumber; j++) {
                let subPath = path.subPathArray[j];
                let vertexCount = subPath.pointsNumber;
                if (vertexCount < 2) continue;
                outputInterface.offset = this.verticesData.currentIndex;
                let pointsArray = subPath.pointsCoordinateArray;
                let inputInterface = {
                    getX: function (index) {
                        index = index * 3;
                        return pointsArray[index];
                    },
                    getY: function (index) {
                        index = index * 3;
                        return pointsArray[index + 1];
                    },
                    getZ: function (index) {
                        index = index * 3;
                        return pointsArray[index + 2];
                    },
                    getPointsNum: function () {
                        return pointsArray.length / 3;
                    }
                };
                let lineNum = LineToRectangle.generateRectanglesPoints(lineWidth, subPath.isClosed, faceDirection, outputInterface,inputInterface);
                for (let k = 0; k < lineNum; k++) {
                    let index = k * 4;
                    this.indexData.addIndex(outputInterface.offset + index);
                    this.indexData.addIndex(outputInterface.offset + index + 1);
                    this.indexData.addIndex(outputInterface.offset + index + 2);

                    this.indexData.addIndex(outputInterface.offset + index + 2);
                    this.indexData.addIndex(outputInterface.offset + index + 3);
                    this.indexData.addIndex(outputInterface.offset + index);
                }
                this.renderPointNumber += lineNum * 6;
            }
        }
    }

    collectVertexDataForFill(pathList, color, opacity, textureCoord, filterType, faceDirection) {
        for (let i = 0; i < pathList.length; i++) {
            let path = pathList[i];
            if (path.subPathNumber == 0) {
                continue;
            }
            for (let j = 0; j < path.subPathNumber; j++) {
                let subPath = path.subPathArray[j];
                if (subPath.pointsNumber < 3) continue; // 小于三个无法填充成一个面
                let vertexOrg;
                let pointArray = subPath.pointsCoordinateArray;
                let pointsNumber = subPath.pointsNumber;
                if (pointsNumber == 3) {
                    vertexOrg = TRIANGLE_ORG;

                } else {
                    if (pointsNumber == 4 && subPath.isRegularRect) {
                        vertexOrg = RECT_ORG;
                    } else {
                        if (pointsNumber * 3 == pointArray.length) {
                            vertexOrg = EarClipping.earcut(pointArray, null, 3);
                        } else {
                            let temp = pointArray.slice(0, pointsNumber * 3);
                            vertexOrg = EarClipping.earcut(temp, null, 3);
                        }
                    }
                }
                this.renderPointNumber += vertexOrg.length;
                if(vertexOrg.length == 0) continue;
                let offset = this.verticesData.currentIndex;
                let k;
                for (k = 0; k < pointsNumber; k++) {
                    if (this.verticesData != null) {
                        this.verticesData.addVerticesData(subPath.getPointX(k), subPath.getPointY(k),
                            subPath.getPointZ(k), faceDirection[0], faceDirection[1], faceDirection[2]);
                    }
                    if (this.fragmentData != null) {
                        let t = undefined;
                        if (textureCoord[0] instanceof Array) {
                            t = textureCoord[k];
                        } else {
                            t = textureCoord;
                        }
                        this.fragmentData.addFragmentData(color[0], color[1], color[2], opacity, t[0], t[1], this.textureIndex, filterType);
                    }
                    if (this.transformData != null) {
                        // 记录转换矩阵数据
                        this.transformData.addMatrixIndex(0);
                    }
                    let vertexIndex = vertexOrg[k];
                    this.indexData.addIndex(vertexIndex + offset);
                }

                let temp = k;
                for (let k = temp; k < vertexOrg.length; k++) {
                    let vertexIndex = vertexOrg[k];
                    this.indexData.addIndex(vertexIndex + offset);
                }
            }
        }

    }
}