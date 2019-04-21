import Vector3 from "../math/Vector3.js";
import Mat3 from "../math/Mat3.js";
import Vector2 from "../math/Vector2.js";
import Mat4 from "../math/Mat4.js";

const TEMP_VET3 = [new Vector3()];
const TEMP_MAT3 = [Mat3.identity()];
export default class GeometryTools {
    constructor() {
    }

    static getProjectionPointOnLine(point, linep1, linep2) {
        let temp = Vector2.TEMP_VECTORS[0];
        temp.x = linep2.x - linep1.x;
        temp.y = linep2.y - linep1.y;
        Vector2.normalize(temp, temp);
        let temp1 = Vector2.TEMP_VECTORS[1];
        temp1.x = point.x - linep1.x;
        temp1.y = point.y - linep1.y;
        let d = Vector2.dot(temp1, temp);
        Vector2.multiplyValue(temp, temp, d);
        let out = {x: 0, y: 0};
        Vector2.plus(out, temp, linep1);
        return out;
    }


    static cubicBezier(t, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, out) {
        // b(t) = (1-t)^3p0 + 3(1-t)^2tp1+3(1-t)t^2p2+t^3p3
        out = out || [0, 0];
        let t1 = 1 - t;
        let x = t1 * t1 * t1 * p0x;
        x += 3 * t1 * t1 * t * p1x;
        x += 3 * t1 * t * t * p2x;
        x += t * t * t * p3x;

        let y = t1 * t1 * t1 * p0y;
        y += 3 * t1 * t1 * t * p1y;
        y += 3 * t1 * t * t * p2y;
        y += t * t * t * p3y;
        out[0] = x;
        out[1] = y;
        return out;
    }

    static quadraticBezier(t, p0x, p0y, p1x, p1y, p2x, p2y, out) {
        // b(t) = (1-t)^2p0 + 2(1-t)tp1+t^2p2
        out = out || [0, 0];
        let t1 = 1 - t;
        let x = t1 * t1 * p0x;
        x += 2 * t1 * t * p1x;
        x += t * t * p2x;
        out[0] = x;

        let y = t1 * t1 * p0y;
        y += 2 * t1 * t * p1y;
        y += t * t * p2y;
        out[1] = y;

        return out;
    }


    /**
     * 计算过椭圆上某两点的椭圆圆心以及两点对应的角度
     * 计算圆心和夹角方法和公式：https://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
     * @param x1 椭圆上某点1 x
     * @param y1 椭圆上某点1 y
     * @param x2 椭圆上某点2 x
     * @param y2 椭圆上某点2 y
     * @param radiusX 椭圆横向半径
     * @param radiusY 椭圆纵向半径
     * @param rotation 椭圆旋转弧度
     * @returns {{x: number, y: number, theta: number, deltaTheta: number}}
     */
    static arcConversionEndpointToCenter(x1, y1, x2, y2, radiusX, radiusY, rotation,) {
        let fa = 0;
        let fs = 1;
        let v = [(x1 - x2) / 2, (y1 - y2) / 2, 1];
        let m = TEMP_MAT3[0];
        if (rotation != 0) {
            Mat3.rotate(m, -rotation);
            Mat3.multiplyWithVertex(m, m, v);
            v[0] = m[0];
            v[1] = m[1];
        }

        let scaleUp = radiusX * radiusX * radiusY * radiusY / (radiusX * radiusX * v[1] * v[1] + radiusY * radiusY * v[0] * v[0]);
        scaleUp = Math.abs(scaleUp - 1);
        if (scaleUp < 0) throw new Error('radius is small, the ellipse does not across these two points');
        let scale = Math.sqrt(scaleUp);
        let sign = 1;
        if (fa == fs) sign = -1;
        scale *= sign;
        let v1 = [radiusX * v[1] / radiusY, -radiusY * v[0] / radiusX, 0];
        v1[0] *= scale;
        v1[1] *= scale;
        let c = [v1[0], v1[1], 1];
        if (rotation != 0) {
            Mat3.rotate(m, rotation);
            Mat3.multiplyWithVertex(m, m, c);
        }
        let cx = c[0] + (x1 + x2) / 2;
        let cy = c[1] + (y1 + y2) / 2;

        let u = Vector2.TEMP_VECTORS[0];
        u.x = 1;
        u.y = 0;
        let u1 = Vector2.TEMP_VECTORS[1];
        u1.x = (v[0] - v1[0]) / radiusX;
        u1.y = (v[1] - v1[1]) / radiusY;

        let theta = Math.abs(Math.acos(Vector2.dot(u, u1) / (u.magnitude * u1.magnitude)));
        if (u.x * u1.y < 0) {
            theta *= -1;
        }
        u.x = (-v[0] - v1[0]) / radiusX;
        u.y = (-v[1] - v1[1]) / radiusY;
        let deltaTheta = Math.acos(Vector2.dot(u, u1) / (u.magnitude * u1.magnitude));
        deltaTheta = Math.abs(deltaTheta % (Math.PI * 2));
        if (fs == 0) deltaTheta *= -1;
        return {x: cx, y: cy, theta: theta, deltaTheta: deltaTheta};
    }

    /**
     * 计算平面椭圆上某弧度对应的坐标点
     * @param x
     * @param y
     * @param radiusX
     * @param radiusY
     * @param radian
     * @param rotation
     * @param output
     * @returns {*}
     */
    static getEllipsePointWithRadian(x, y, radiusX, radiusY, radian, rotation, output) {
        output = output || [0, 0];
        let v = TEMP_VET3[0];
        v.x = radiusX * Math.cos(radian);
        v.y = radiusY * Math.sin(radian);
        v.z = 0;
        if (rotation != 0) {
            let m = TEMP_MAT3[0];
            Mat3.rotate(m, rotation);
            Mat3.multiplyWithVertex(m, m, v.value);
            v.x = m[0];
            v.y = m[1];
        }
        output[0] = v.x + x;
        output[1] = v.y + y;
        return output;
    }

    static getRodriguesRotateMatrix(v1, v2) {
        // R = I + K sin(theta) + (1- cos(theta)) K^2
        // K = [0 , -k2 , k1
        //      k2 , 0 , -k0
        //      -k1, k0,0 ]
        // k = normalize(v1 x v2) = [k0,k1,k2]
        let cos = Vector3.dot(v1, v2);
        let sin = Math.sin(Math.acos(cos));
        let k = TEMP_VET3[0];
        Vector3.cross(k, v1, v2);
        Vector3.normalize(k, k);

        let r = TEMP_MAT3[0];
        r[0] = 0;
        r[1] = -k.value[2];
        r[2] = k.value[1];
        r[3] = k.value[2];
        r[4] = 0;
        r[5] = -k.value[0];
        r[6] = -k.value[1];
        r[7] = k.value[0];
        r[8] = 0;

        let k1 = Mat3.identity();
        Mat3.copy(r, k1);
        let I = Mat3.identity();
        Mat3.multiplyWithValue(r, r, sin);

        Mat3.multiply(k1, k1, k1);
        Mat3.multiplyWithValue(k1, k1, (1 - cos));
        Mat3.plus(k1, k1, r);
        Mat3.plus(k1, k1, I);

        Mat3.rotateMatrix(k1,k1);

        return Mat4.transformMat3ToMat4(k1);
    }


    /**
     * 计算空间中线到面的交点
     * 计算方法来自：http://geomalgorithms.com/a05-_intersect-1.html
     * @param n 面的法向量（单位向量）
     * @param u 线的向量 （单位向量）
     * @param p 线上某点
     * @param v 面上某点
     * @returns {*}
     */
    static calculateIntersectionOfPlane(n, u, p, v, out, maxLength) {
        let down = Vector3.dot(n, u);
        if (Math.abs(down) == 0) {
            return null;
        }
        let w = TEMP_VET3[0];
        w.x = v.x - p.x;
        w.y = v.y - p.y;
        w.z = v.z - p.z;
        let length = Vector3.dot(w, n) / down;
        let sign = length > 0 ? 1 : -1;
        let realLength = length;
        if (maxLength != undefined) {
            if (Math.abs(length) > maxLength) {
                realLength = maxLength * sign;
            }
        }
        length = realLength;
        Vector3.multiplyValue(w, u, length);
        Vector3.plus(out, w, p);
        // return out;
    }

    /**
     * 计算平面上两条线的交点
     * @param p1
     * @param p2
     * @param p3
     * @param p4
     * @returns {*}
     */
    static calculateIntersectionOfTowLines(p1, p2, p3, p4) {
        let x1 = p1.x;
        let y1 = p1.y;

        let x2 = p2.x;
        let y2 = p2.y;

        let x3 = p3.x;
        let y3 = p3.y;

        let x4 = p4.x;
        let y4 = p4.y;

        let share = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (share == 0) return undefined;
        let px = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
        px = px / share;

        let py = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
        py = py / share;

        return {x: px, y: py};
    }
}