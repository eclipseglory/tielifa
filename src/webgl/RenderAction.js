import VertexData from "./VertexData.js";
import EarClipping from "../geometry/EarClipping.js";

const ACTION_STROKE = 0; // stroke动作
const ACTION_FILL = 1; // fill动作

export default class RenderAction {
    constructor(type) {
        this.type = type;
        this.vertexData = null;
        this.textureIndex = -1;
    }

    getVertexData(vertexNumber) {
        if (this.vertexData == null) {
            this.vertexData = new VertexData(this.type, vertexNumber);
        } else {
            this.vertexData.resize(vertexNumber);
        }
        return this.vertexData;
    }

    static get ACTION_STROKE() {
        return ACTION_STROKE;
    }

    static get ACTION_FILL() {
        return ACTION_FILL;
    }

    collectVertexData(pathList, color, opacity, textureCoord) {
        if (this.type == ACTION_FILL) {
            this.collectVertexDataForFill(pathList, color, opacity, textureCoord);
            return;
        }
        if (this.type == ACTION_STROKE) {
            this.collectVertexDataForStroke(pathList, color, opacity, textureCoord);
            return;
        }
    }

    collectVertexDataForStroke(pathList, color, opacity, textureCoord) {
        for (let i = 0; i < pathList.length; i++) {
            let path = pathList[i];
            for (let j = 0; j < path.subPathNumber; j++) {
                let subPath = path.subPathArray[j];
                let vertexCount = subPath.pointsNumber;
                if (vertexCount < 2) continue;
                if (subPath.isClosed) vertexCount++;
                let vertexData = this.getVertexData(vertexCount);
                for (let i = 0; i < vertexCount; i++) {
                    let index = i % subPath.pointsNumber;
                    vertexData.addMatrixIdData(subPath.getPoint(index).matrixIdData);
                    vertexData.addVertexData(subPath.getPoint(index).value, color, opacity, textureCoord);
                }
            }
        }
    }

    collectVertexDataForFill(pathList, color, opacity, textureCoord) {
        for (let i = 0; i < pathList.length; i++) {
            let path = pathList[i];
            if (path.subPathNumber == 0) {
                continue;
            }
            for (let j = 0; j < path.subPathNumber; j++) {
                let subPath = path.subPathArray[j];
                if (subPath.pointsNumber < 3) continue; // 小于三个无法填充成一个面
                this.organizeVertexForFill(subPath, color, opacity, textureCoord)
            }
        }
    }

    organizeVertexForFill(subPath, color, opacity, textureCoord) {
        let temp = new Array(subPath.pointsNumber * 2);
        for (let i = 0; i < subPath.pointsNumber; i++) {
            let p = subPath.getPoint(i);
            let index = i * 2;
            temp[index] = p.x;
            temp[index + 1] = p.y;
        }
        let vertexOrg = EarClipping.earcut(temp);
        let vertexData = this.getVertexData(vertexOrg.length);
        for (let i = 0; i < vertexOrg.length; i++) {
            let vertexIndex = vertexOrg[i];
            vertexData.addMatrixIdData(subPath.getPoint(vertexIndex).matrixIdData);
            if (textureCoord[0] instanceof Array) {
                vertexData.addVertexData(subPath.getPoint(vertexIndex).value, color, opacity, textureCoord[vertexIndex]);
            } else {
                vertexData.addVertexData(subPath.getPoint(vertexIndex).value, color, opacity, textureCoord);
            }
        }
    }
}