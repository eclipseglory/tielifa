import Vector3 from "../math/Vector3.js";
import GeometryTools from "./GeometryTools.js";
import Tools from "../utils/Tools.js";

let p1Temp = new Vector3(0, 0, 0);
let p2Temp = new Vector3(0, 0, 0);

let halfWidth = new Float32Array(1);

let faceDirectionTemp = new Vector3();

let lastR1Temp = new Vector3(0, 0, 0);
let lastR2Temp = new Vector3(0, 0, 0);
let lastR3Temp = new Vector3(0, 0, 0);
let lastR4Temp = new Vector3(0, 0, 0);

let r1Temp = new Vector3(0, 0, 0);
let r2Temp = new Vector3(0, 0, 0);
let r3Temp = new Vector3(0, 0, 0);
let r4Temp = new Vector3(0, 0, 0);

let firstPoint1 = new Vector3(0, 0, 0);
let firstPoint2 = new Vector3(0, 0, 0);
let firstPoint3 = new Vector3(0, 0, 0);
let firstPoint4 = new Vector3(0, 0, 0);

let lastPoint1 = new Vector3(0, 0, 0);
let lastPoint2 = new Vector3(0, 0, 0);
let lastPoint3 = new Vector3(0, 0, 0);
let lastPoint4 = new Vector3(0, 0, 0);

let rayVectorTemp = new Vector3(0, 0, 0);
let planeNormalTemp = new Vector3();

let line1VectorTemp = new Vector3(0, 0, 0);
let line2VectorTemp = new Vector3(0, 0, 0);

let endIndex = 0;
export default class LineToRectangle {
    constructor(lineWidth) {
    }

    static generateRectanglesPoints(lineWidth, isClosed, faceDirection, outputInterface, inputInterface) {
        if (lineWidth == undefined) lineWidth = 1;
        outputInterface = outputInterface || {};
        let setPoint = outputInterface.setPoint;
        let addPoint = outputInterface.addPoint;
        let rectPoints = [];
        if (setPoint == undefined) {
            setPoint = function (point, index) {
                index = index * 3;
                rectPoints[index] = point.x;
                rectPoints[index + 1] = point.y;
                rectPoints[index + 2] = point.z;
            };
        }
        if (addPoint == undefined) {
            addPoint = function (point) {
                rectPoints.push(point.x);
                rectPoints.push(point.y);
                rectPoints.push(point.z);
            };
        }


        halfWidth[0] = lineWidth / 2;
        endIndex = 0;
        if (inputInterface == null || inputInterface.getPointsNum() < 2) {
            return 0;
        }
        // if (points == null || points.length / 3 < 2) {
        //     return null;
        // }
        faceDirectionTemp.x = faceDirection[0];
        faceDirectionTemp.y = faceDirection[1];
        faceDirectionTemp.z = faceDirection[2];
        // let pointsCount = points.length / 3;
        let pointsCount = inputInterface.getPointsNum();
        let preRectLastPoints = {r1: null, r2: null, r3: null, r4: null};
        let lineCount = pointsCount - 1;
        let that = this;
        //不确定设定的面朝向法向量是否是单位向量：
        Vector3.normalize(faceDirectionTemp, faceDirectionTemp);
        if (isClosed) lineCount++;
        let dim = 3;
        for (let i = 0; i < lineCount; i++) {
            // let index = i * dim;
            // let x1 = points[index];
            // let y1 = points[index + 1];
            // p1Temp.x = x1;
            // p1Temp.y = y1;
            // p1Temp.z = points[index + 2];
            // p1Temp.z = inputInterface.getZ(i);

            p1Temp.x = inputInterface.getX(i);
            p1Temp.y = inputInterface.getY(i);
            p1Temp.z = inputInterface.getZ(i);

            // let nextIndex = ((i + 1) * 3);
            // if (nextIndex >= points.length) nextIndex = 0;
            let nextPointIndex = i + 1;
            if (nextPointIndex >= pointsCount) nextPointIndex = 0;
            // let x2 = points[nextIndex];
            // let y2 = points[nextIndex + 1];
            // x2 = inputInterface.getX(nextPointIndex);
            // y2 = inputInterface.getY(nextPointIndex);
            // p2Temp.x = x2;
            // p2Temp.y = y2;
            // p2Temp.z = points[nextIndex + 2];
            // p2Temp.z = inputInterface.getZ(nextPointIndex);

            p2Temp.x = inputInterface.getX(nextPointIndex);
            p2Temp.y = inputInterface.getY(nextPointIndex);
            p2Temp.z = inputInterface.getZ(nextPointIndex);


            line1VectorTemp.x = p2Temp.x - p1Temp.x;
            line1VectorTemp.y = p2Temp.y - p1Temp.y;
            line1VectorTemp.z = p2Temp.z - p1Temp.z;
            let temp = Vector3.TEMP_VECTORS[0];
            Vector3.cross(temp, line1VectorTemp, faceDirectionTemp);
            Vector3.normalize(temp, temp);
            temp.x *= halfWidth[0];
            temp.y *= halfWidth[0];
            temp.z *= halfWidth[0];
            Vector3.plus(r1Temp, temp, p1Temp);
            Vector3.plus(r2Temp, temp, p2Temp);
            // 反向
            temp.x = -temp.x;
            temp.y = -temp.y;
            temp.z = -temp.z;
            Vector3.plus(r3Temp, temp, p2Temp);
            Vector3.plus(r4Temp, temp, p1Temp);

            let lastR1 = preRectLastPoints.r1;
            let lastR4 = preRectLastPoints.r4;
            let lastR2 = preRectLastPoints.r2;
            let lastR3 = preRectLastPoints.r3;
            if (lastR1 != null) {
                this.updateConnectPoints(lastR1, lastR2, lastR3, lastR4, r1Temp, r2Temp, r3Temp, r4Temp, i, line1VectorTemp, faceDirectionTemp, rectPoints, setPoint);
            }


            //组织三角形
            addPoint(r1Temp, i, 0);
            addPoint(r2Temp, i, 1);
            addPoint(r3Temp, i, 2);
            addPoint(r4Temp, i, 3);

            lastR1Temp.value[0] = r1Temp.value[0];
            lastR1Temp.value[1] = r1Temp.value[1];
            lastR1Temp.value[2] = r1Temp.value[2];

            lastR2Temp.value[0] = r2Temp.value[0];
            lastR2Temp.value[1] = r2Temp.value[1];
            lastR2Temp.value[2] = r2Temp.value[2];

            lastR3Temp.value[0] = r3Temp.value[0];
            lastR3Temp.value[1] = r3Temp.value[1];
            lastR3Temp.value[2] = r3Temp.value[2];

            lastR4Temp.value[0] = r4Temp.value[0];
            lastR4Temp.value[1] = r4Temp.value[1];
            lastR4Temp.value[2] = r4Temp.value[2];
            if (i == 0) {
                firstPoint1.value[0] = r1Temp.value[0];
                firstPoint1.value[1] = r1Temp.value[1];
                firstPoint1.value[2] = r1Temp.value[2];

                firstPoint2.value[0] = r2Temp.value[0];
                firstPoint2.value[1] = r2Temp.value[1];
                firstPoint2.value[2] = r2Temp.value[2];

                firstPoint3.value[0] = r3Temp.value[0];
                firstPoint3.value[1] = r3Temp.value[1];
                firstPoint3.value[2] = r3Temp.value[2];

                firstPoint4.value[0] = r4Temp.value[0];
                firstPoint4.value[1] = r4Temp.value[1];
                firstPoint4.value[2] = r4Temp.value[2];
            }
            if (i + 1 == lineCount) {
                lastPoint1.value[0] = r1Temp.value[0];
                lastPoint1.value[1] = r1Temp.value[1];
                lastPoint1.value[2] = r1Temp.value[2];

                lastPoint2.value[0] = r2Temp.value[0];
                lastPoint2.value[1] = r2Temp.value[1];
                lastPoint2.value[2] = r2Temp.value[2];

                lastPoint3.value[0] = r3Temp.value[0];
                lastPoint3.value[1] = r3Temp.value[1];
                lastPoint3.value[2] = r3Temp.value[2];

                lastPoint4.value[0] = r4Temp.value[0];
                lastPoint4.value[1] = r4Temp.value[1];
                lastPoint4.value[2] = r4Temp.value[2];
            }


            preRectLastPoints.r1 = lastR1Temp;
            preRectLastPoints.r2 = lastR2Temp;
            preRectLastPoints.r3 = lastR3Temp;
            preRectLastPoints.r4 = lastR4Temp;
        }

        if (isClosed) {
            //开始和结尾的地方连接点要改一下
            let endIndex = lineCount * 4;//rectPoints.length / 3;
            rayVectorTemp.x = lastPoint2.x - lastPoint1.x;
            rayVectorTemp.y = lastPoint2.y - lastPoint1.y;
            rayVectorTemp.z = lastPoint2.z - lastPoint1.z;
            let u1 = rayVectorTemp;
            Vector3.normalize(u1, u1);
            let temp1 = Vector3.TEMP_VECTORS[1];
            temp1.x = firstPoint1.x - firstPoint2.x;
            temp1.y = firstPoint1.y - firstPoint2.y;
            temp1.z = firstPoint1.z - firstPoint2.z;
            // TODO 如果平行，要跟之前连接点处理一致才行
            let n = planeNormalTemp;
            Vector3.cross(n, temp1, faceDirectionTemp);
            Vector3.normalize(n, n);
            let temp = Vector3.TEMP_VECTORS[0]
            GeometryTools.calculateIntersectionOfPlane(n, u1, lastPoint2, firstPoint2, temp);
            if (temp != undefined) {
                setPoint(temp, 0);
                setPoint(temp, endIndex - 3);
            }
            u1.x = lastPoint3.x - lastPoint4.x;
            u1.y = lastPoint3.y - lastPoint4.y;
            u1.z = lastPoint3.z - lastPoint4.z;
            Vector3.normalize(u1, u1);

            GeometryTools.calculateIntersectionOfPlane(n, u1, lastPoint3, firstPoint4, temp);
            if (temp != undefined) {
                setPoint(temp, 3);
                setPoint(temp, endIndex - 2);
            }
        }
        if (rectPoints.length == 0) {
            return lineCount;
        }
        return rectPoints;
        // return {rects: rectPoints, end: rectPoints.length};
    }

    /**@deprecated*/
    static setPointValue(x, y, z, index, rectPoints) {
        index = index * 3;
        rectPoints[index] = x;
        rectPoints[index + 1] = y;
        rectPoints[index + 2] = z;
    }

    static updateRectPoint(p, p1, lineIndex, rectPoints, setPoint) {
        lineIndex = lineIndex * 4;
        let r2Index = lineIndex + 1;
        let r3Index = r2Index + 1;
        if (p != null) {
            setPoint(p, r2Index);
        }
        if (p1 != null) {
            setPoint(p1, r3Index);
        }
    }

    static updateConnectPoints(lastR1, lastR2, lastR3, lastR4, r1, r2, r3, r4, lineIndex, lineDirection, faceDirection, rectPoints, setPoint) {
        let maxLength = Tools.getDistance(lastR2, r1)*2;
        let temp = Vector3.TEMP_VECTORS[0];
        let u1 = rayVectorTemp;
        u1.x = lastR2.x - lastR1.x;
        u1.y = lastR2.y - lastR1.y;
        u1.z = lastR2.z - lastR1.z;
        Vector3.normalize(u1, u1);
        // Vector3.normalize(lineDirection, lineDirection);
        let n = planeNormalTemp;
        Vector3.cross(n, lineDirection, faceDirection);
        Vector3.normalize(n, n);

        /*
        * 几乎平行：无法做交点计算，当前线段的矩形的p1和p4改成前一条线的p2,p3
        */
        let down = Vector3.dot(n, u1);
        if (Math.abs(down) < Tools.EPSILON) {
            r1.x = lastR2.x;
            r1.y = lastR2.y;
            r1.z = lastR2.z;
            r4.x = lastR3.x;
            r4.y = lastR3.y;
            r4.z = lastR3.z;
            return;
        }
        /*
         * 这里计算出没有交点时两条线端点距离，作为最大的距离（计算交点时候的向量所放量）
         * 如果距离过大则需要计算，因为有时候两条线趋于平行，会造成计算出的交点特别远，这就让整个图形看上去是错误的
         */
       GeometryTools.calculateIntersectionOfPlane(n, u1, lastR2, r1, line2VectorTemp, maxLength);
        // 此时说明两条线几乎平行无法计算出交点.当前线段的矩形的p1和p4改成前一条线的p2,p3
        if (line2VectorTemp != null) {
            //更新上个矩形r2和这个矩形的r1
            r1.x = line2VectorTemp.x;
            r1.y = line2VectorTemp.y;
            r1.z = line2VectorTemp.z;
        }
        u1.x = lastR3.x - lastR4.x;
        u1.y = lastR3.y - lastR4.y;
        u1.z = lastR3.z - lastR4.z;
        Vector3.normalize(u1, u1);
        GeometryTools.calculateIntersectionOfPlane(n, u1, lastR3, r4, temp, maxLength);
        if (temp != null) {
            //更新上个矩形r3和这个矩形的r4
            r4.x = temp.x;
            r4.y = temp.y;
            r4.z = temp.z;
        }
        this.updateRectPoint(line2VectorTemp, temp, lineIndex - 1, rectPoints, setPoint);
    }

    /**@deprecated*/
    static addPoint(point, rectPoints) {
        rectPoints.push(point.x);
        rectPoints.push(point.y);
        rectPoints.push(point.z);
    }
}