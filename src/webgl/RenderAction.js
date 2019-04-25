import EarClipping from "../geometry/EarClipping.js";
import LineToRectangle from "../geometry/LineToRectangle.js";

const ACTION_STROKE = 0; // stroke动作
const ACTION_FILL = 1; // fill动作

const TRIANGLE_ORG = [0, 1, 2];
const RECT_ORG = [0, 1, 2, 0, 2, 3];
export default class RenderAction {
    constructor(type) {
        this.type = type;
        this.textureIndex = -1;

        this.vdo = null;

        this.renderPointNumber = 0;
        this.opacityPointNumber = 0;
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

    collectVertexDataForStroke(pathList, color, opacity, textureCoord, lineWidth, filterType, faceDirection, useOpacity) {
        let that = this;
        if (useOpacity == null) useOpacity = false;
        if (opacity < 1) {
            useOpacity = true;
        }
        this.vdo.switch(useOpacity);
        let outputInterface = {
            setPoint: function (p, index) {
                that.vdo.setVerticesCoor2(p, index + outputInterface.offset);
            },
            addPoint: function (p) {
                that.vdo.addVerticesData3(p.x, p.y, p.z, faceDirection, color, opacity, textureCoord, -1, filterType)
            }
        };

        let indexData = null;

        for (let i = 0; i < pathList.length; i++) {
            let path = pathList[i];
            for (let j = 0; j < path.subPathNumber; j++) {
                let subPath = path.subPathArray[j];
                let vertexCount = subPath.pointsNumber;
                if (vertexCount < 2) continue;
                outputInterface.offset = this.vdo.currentIndex;
                indexData = this.vdo.currentIndexData;
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
                let lineNum = LineToRectangle.generateRectanglesPoints(lineWidth, subPath.isClosed, faceDirection, outputInterface, inputInterface);
                for (let k = 0; k < lineNum; k++) {
                    let index = k * 4;
                    indexData.addIndex(outputInterface.offset + index);
                    indexData.addIndex(outputInterface.offset + index + 1);
                    indexData.addIndex(outputInterface.offset + index + 2);

                    indexData.addIndex(outputInterface.offset + index + 2);
                    indexData.addIndex(outputInterface.offset + index + 3);
                    indexData.addIndex(outputInterface.offset + index);
                }
                if (!useOpacity) {
                    this.renderPointNumber += lineNum * 6;
                } else {
                    this.opacityPointNumber += lineNum * 6;
                }
            }
        }
        this.vdo.switch(false);
    }

    collectVertexDataForFill(pathList, color, opacity, textureCoord, filterType, faceDirection, useOpacity) {
        let indexData = null;
        if (useOpacity == null) useOpacity = false;
        if(opacity < 1) useOpacity = true;
        this.vdo.switch(useOpacity);
        for (let i = 0; i < pathList.length; i++) {
            let path = pathList[i];
            if (path.subPathNumber === 0) {
                continue;
            }
            for (let j = 0; j < path.subPathNumber; j++) {
                let subPath = path.subPathArray[j];
                if (subPath.pointsNumber < 3) continue; // 小于三个无法填充成一个面
                let vertexOrg;
                let pointArray = subPath.pointsCoordinateArray;
                let pointsNumber = subPath.pointsNumber;
                if (pointsNumber === 3) {
                    vertexOrg = TRIANGLE_ORG;

                } else {
                    if (pointsNumber === 4 && subPath.isRegularRect) {
                        vertexOrg = RECT_ORG;
                    } else {
                        if (pointsNumber * 3 === pointArray.length) {
                            vertexOrg = EarClipping.earcut(pointArray, null, 3);
                        } else {
                            let temp = pointArray.slice(0, pointsNumber * 3);
                            vertexOrg = EarClipping.earcut(temp, null, 3);
                        }
                    }
                }
                if (!useOpacity) {
                    this.renderPointNumber += vertexOrg.length;
                } else {
                    this.opacityPointNumber += vertexOrg.length;
                }

                if (vertexOrg.length === 0) continue;
                // let offset = this.verticesData.currentIndex;
                let offset = this.vdo.currentIndex;
                indexData = this.vdo.currentIndexData;
                let k;
                for (k = 0; k < pointsNumber; k++) {
                    let UV = undefined;
                    if (textureCoord[0] instanceof Array) {
                        UV = textureCoord[k];
                    } else {
                        UV = textureCoord;
                    }

                    this.vdo.addVerticesData3(subPath.getPointX(k), subPath.getPointY(k),
                        subPath.getPointZ(k), faceDirection, color, opacity, UV, this.textureIndex, filterType);

                    let vertexIndex = vertexOrg[k];
                    indexData.addIndex(vertexIndex + offset);
                }

                let temp = k;
                for (let k = temp; k < vertexOrg.length; k++) {
                    let vertexIndex = vertexOrg[k];
                    indexData.addIndex(vertexIndex + offset);
                }
            }
        }
        this.vdo.switch(false);
    }
}