import Tools from "../utils/Tools.js";
import Vector3 from "./Vector3.js";
import Mat3 from "./Mat3.js";

let temp_mat4 = undefined;
export default class Mat4 {
    constructor() {
    }

    static get TEMP_MAT4() {
        if (temp_mat4 == undefined) {
            temp_mat4 = [Mat4.identity(), Mat4.identity(), Mat4.identity(), Mat4.identity()];
        }
        return temp_mat4;
    }


    static get EPSILON() {
        return Tools.EPSILON;
    }

    static perspective2(left, top, right, bottom, near, far) {
        return [
            2 * near / (right - left), 0, 0, 0,
            0, 2 * near / (top - bottom), 0, 0,
            (right + left) / (right - left), (bottom + top) / (top - bottom), (-near - far) / (far - near), -1,
            0, 0, (-near * far * 2) / (far - near), 0
        ];
    }

    static perspective3(fieldOfViewInRadians, width, height, near, far, out) {
        let m = this.perspective(fieldOfViewInRadians, width / height, near, far, out);
        let m1 = Mat4.TEMP_MAT4[0];
        Mat4.translationMatrix(m1, -width / 2, -height / 2, 0);
        Mat4.multiply(m, m, m1);
        return m;
    }

    static isIdentity(m) {
        return !(m[0] !== 1
            || m[1] !== 0
            || m[2] !== 0
            || m[3] !== 0
            || m[4] !== 0
            || m[5] !== 1
            || m[6] !== 0
            || m[7] !== 0
            || m[8] !== 0
            || m[9] !== 0
            || m[10] !== 1
            || m[11] !== 0
            || m[12] !== 0
            || m[13] !== 0
            || m[14] !== 0
            || m[15] !== 1);

    }

    static perspective(fieldOfViewInRadians, aspect, near, far, out) {
        let f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        if (Tools.equals(f, 1)) f = 1;
        let rangeInv = 1.0 / (near - far);
        let m;
        if (out != undefined) {
            this.identityMatrix(out);
            m = out;
        } else {
            m = this.identity();
        }
        m[0] = f / aspect;
        m[5] = -f;
        m[10] = (near + far) * rangeInv;
        m[11] = -1;
        m[14] = near * far * rangeInv * 2;

        // return [
        //     f / aspect, 0, 0, 0,
        //     0, f, 0, 0,
        //     0, 0, (near + far) * rangeInv, -1,
        //     0, 0, near * far * rangeInv * 2, 0
        // ];
        return m;
    }

    static orthoProjection(left, top, right, bottom, near, far, out) {
        if (out != undefined) {
            this.identityMatrix(out);
            out[0] = 2 / (right - left);
            out[5] = 2 / (top - bottom);
            out[10] = 2 / (near - far);
            out[12] = (left + right) / (left - right);
            out[13] = (bottom + top) / (bottom - top);
            out[14] = (near + far) / (near - far);
            return out;
        } else {
            return new Float32Array([
                2 / (right - left), 0, 0, 0,
                0, 2 / (top - bottom), 0, 0,
                0, 0, 2 / (near - far), 0,

                (left + right) / (left - right),
                (bottom + top) / (bottom - top),
                (near + far) / (near - far),
                1
            ]);
        }
    }

    static copy(from, to) {
        to[0] = from[0];
        to[1] = from[1];
        to[2] = from[2];
        to[3] = from[3];
        to[4] = from[4];
        to[5] = from[5];
        to[6] = from[6];
        to[7] = from[7];
        to[8] = from[8];
        to[9] = from[9];
        to[10] = from[10];
        to[11] = from[11];
        to[12] = from[12];
        to[13] = from[13];
        to[14] = from[14];
        to[15] = from[15];
    }


    static equals(a, b) {
        let a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
        let a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7];
        let a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11];
        let a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];

        let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        let b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
        let b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11];
        let b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];

        return (Math.abs(a0 - b0) <= Tools.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= Tools.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= Tools.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= Tools.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
            Math.abs(a4 - b4) <= Tools.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
            Math.abs(a5 - b5) <= Tools.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
            Math.abs(a6 - b6) <= Tools.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
            Math.abs(a7 - b7) <= Tools.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
            Math.abs(a8 - b8) <= Tools.EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) &&
            Math.abs(a9 - b9) <= Tools.EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) &&
            Math.abs(a10 - b10) <= Tools.EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) &&
            Math.abs(a11 - b11) <= Tools.EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) &&
            Math.abs(a12 - b12) <= Tools.EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) &&
            Math.abs(a13 - b13) <= Tools.EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) &&
            Math.abs(a14 - b14) <= Tools.EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) &&
            Math.abs(a15 - b15) <= Tools.EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15)));
    }

    static exactEquals(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] &&
            a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] &&
            a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] &&
            a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
    }

    static projection(width, height, depth) {
        let m = this.identity();
        m[0] = 2 / width;
        m[5] = -2 / height;
        m[10] = 2 / depth;
        m[12] = -1;
        m[13] = 1;
        m[15] = 1;
        return m;
    }

    static identity() {
        // let m = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let m = new Float32Array(16);
        m[0] = 1;
        m[5] = 1;
        m[10] = 1;
        m[15] = 1;
        return m;
    }

    static identityMatrix(matrix) {
        let m = matrix;
        m[0] = 1;
        m[1] = 0;
        m[2] = 0;
        m[3] = 0;
        m[4] = 0;
        m[5] = 1;
        m[6] = 0;
        m[7] = 0;
        m[8] = 0;
        m[9] = 0;
        m[10] = 1;
        m[11] = 0;
        m[12] = 0;
        m[13] = 0;
        m[14] = 0;
        m[15] = 1;
    }

    static translationMatrix(out, tx, ty, tz) {
        let m = out;
        m[0] = 1;
        m[1] = 0;
        m[2] = 0;
        m[3] = 0;
        m[4] = 0;
        m[5] = 1;
        m[6] = 0;
        m[7] = 0;
        m[8] = 0;
        m[9] = 0;
        m[10] = 1;
        m[11] = 0;
        m[12] = tx;
        m[13] = ty;
        m[14] = tz;
        m[15] = 1;
    }

    static translation(tx, ty, tz) {
        let m = this.identity();
        m[12] = tx;
        m[13] = ty;
        m[14] = tz;
        return m;
    }

    static rotationZMatrix(out, radian) {
        let m = out;
        m[2] = 0;
        m[3] = 0;
        m[6] = 0;
        m[7] = 0;
        m[8] = 0;
        m[9] = 0;
        m[10] = 1;
        m[11] = 0;
        m[12] = 0;
        m[13] = 0;
        m[14] = 0;
        m[15] = 1;

        let c = Math.cos(radian);
        let s = Math.sin(radian);
        m[0] = c;
        m[1] = s;
        m[4] = -s;
        m[5] = c;
    }

    static rotationZ(angleInRadians) {
        let c = Math.cos(angleInRadians);
        let s = Math.sin(angleInRadians);
        let m = this.identity();
        m[0] = c;
        m[1] = s;
        m[4] = -s;
        m[5] = c;
        return m;
    }

    static rotationXMatrix(out, radian) {
        let m = out;
        m[0] = 1;
        m[1] = 0;
        m[2] = 0;
        m[3] = 0;
        m[4] = 0;
        m[7] = 0;
        m[8] = 0;
        m[11] = 0;
        m[12] = 0;
        m[13] = 0;
        m[14] = 0;
        m[15] = 1;
        /* [1,0,0,0
            0,c,s,0
            0,-s,c,0
            0,0,0,1]
         */

        let c = Math.cos(radian);
        let s = Math.sin(radian);
        m[5] = c;
        m[6] = s;
        m[9] = -s;
        m[10] = c;
    }

    static rotationX(angleInRadians) {
        let c = Math.cos(angleInRadians);
        let s = Math.sin(angleInRadians);
        let m = this.identity();
        m[5] = c;
        m[6] = s;
        m[9] = -s;
        m[10] = c;
        return m;
    }

    static rotationYMatrix(out, radian) {
        let m = out;
        m[1] = 0;
        m[3] = 0;
        m[4] = 0;
        m[5] = 1;
        m[6] = 0;
        m[7] = 0;
        m[9] = 0;
        m[11] = 0;
        m[12] = 0;
        m[13] = 0;
        m[14] = 0;
        m[15] = 1;

        /* [c,0,-s,0
           0,1,0,0
           s,0,c,0
           0,0,0,1]
        */

        let c = Math.cos(radian);
        let s = Math.sin(radian);
        m[0] = c;
        m[2] = -s;
        m[8] = s;
        m[10] = c;
    }

    static rotationY(angleInRadians) {
        let c = Math.cos(angleInRadians);
        let s = Math.sin(angleInRadians);
        let m = this.identity();
        m[0] = c;
        m[2] = -s;
        m[8] = s;
        m[10] = c;
        return m;
    }

    static scalingMatrix(out, sx, sy, sz) {
        let m = out;
        m[0] = sx;
        m[1] = 0;
        m[2] = 0;
        m[3] = 0;
        m[4] = 0;
        m[5] = sy;
        m[6] = 0;
        m[7] = 0;
        m[8] = 0;
        m[9] = 0;
        m[10] = sz;
        m[11] = 0;
        m[12] = 0;
        m[13] = 0;
        m[14] = 0;
        m[15] = 1;
    }

    static mat4ToMat3(mat4, out) {
        if (out === undefined) {
            out = Mat3.identity();
        }
        out[0] = mat4[0];
        out[1] = mat4[1];
        out[2] = mat4[2];
        out[3] = mat4[4];
        out[4] = mat4[5];
        out[5] = mat4[6];
        out[6] = mat4[8];
        out[7] = mat4[9];
        out[8] = mat4[10];
        return out;
    }

    static lookAt(cameraPosition, target, up, out) {
        if (out == null) {
            out = this.identity();
        }
        if (up == null) {
            up = {x: 0, y: 1, z: 0};
        }
        if (target == null) {
            target = {x: 0, y: 0, z: 0};
        }
        let zAxis = {x: 0, y: 0, z: 0};
        Vector3.sub(zAxis, cameraPosition, target);
        Vector3.normalize(zAxis, zAxis);
        out[8] = zAxis.x;
        out[9] = zAxis.y;
        out[10] = zAxis.z;

        let xAxis = {x: 0, y: 0, z: 0};
        Vector3.cross(xAxis, up, zAxis);
        out[0] = xAxis.x;
        out[1] = xAxis.y;
        out[2] = xAxis.z;

        let yAxis = {x: 0, y: 0, z: 0};
        Vector3.cross(yAxis, zAxis, xAxis);
        out[4] = yAxis.x;
        out[5] = yAxis.y;
        out[6] = yAxis.z;

        out[12] = cameraPosition.x;
        out[13] = cameraPosition.y;
        out[14] = cameraPosition.z;

        return out;
    }


    static scaling(sx, sy, sz) {
        let m = this.identity();
        m[0] = sx;
        m[5] = sy;
        m[10] = sz;
        return m;
    }

    static multiplyWithVet3(matrix, vet3, out) {
        let a00 = matrix[0];
        let a01 = matrix[1];
        let a02 = matrix[2];
        let a03 = matrix[3];
        let a10 = matrix[4];
        let a11 = matrix[5];
        let a12 = matrix[6];
        let a13 = matrix[7];
        let a20 = matrix[8];
        let a21 = matrix[9];
        let a22 = matrix[10];
        let a23 = matrix[11];
        let a30 = matrix[12];
        let a31 = matrix[13];
        let a32 = matrix[14];
        let a33 = matrix[15];

        let b00 = vet3.x;
        let b01 = vet3.y;
        let b02 = vet3.z;
        let b03 = 1;
        out.x = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        out.y = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        out.z = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        return out;
    }

    static multiplyWithVertex(matrix, vertex, out) {
        let a00 = matrix[0];
        let a01 = matrix[1];
        let a02 = matrix[2];
        let a03 = matrix[3];
        let a10 = matrix[4];
        let a11 = matrix[5];
        let a12 = matrix[6];
        let a13 = matrix[7];
        let a20 = matrix[8];
        let a21 = matrix[9];
        let a22 = matrix[10];
        let a23 = matrix[11];
        let a30 = matrix[12];
        let a31 = matrix[13];
        let a32 = matrix[14];
        let a33 = matrix[15];

        let b00 = vertex[0];
        let b01 = vertex[1];
        let b02 = vertex[2];
        let b03 = vertex[3];
        if (b02 == undefined) b02 = 0;
        if (b03 == undefined) b03 = 1;
        // if (out == undefined) {
        //     out = [0, 0, 0, 0];
        // }
        out[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        out[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        out[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        out[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        return out;
    }

    static multiply(out, a, b) {
        // if(!(a instanceof Float32Array) || !(b instanceof Float32Array)){
        //     console.log('here');
        // }
        let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        // Cache only the current line of the second matrix
        let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[4];
        b1 = b[5];
        b2 = b[6];
        b3 = b[7];
        out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[8];
        b1 = b[9];
        b2 = b[10];
        b3 = b[11];
        out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[12];
        b1 = b[13];
        b2 = b[14];
        b3 = b[15];
        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        return out;
    }

    static inverse(out, a) {
        let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        let b00 = a00 * a11 - a01 * a10;
        let b01 = a00 * a12 - a02 * a10;
        let b02 = a00 * a13 - a03 * a10;
        let b03 = a01 * a12 - a02 * a11;
        let b04 = a01 * a13 - a03 * a11;
        let b05 = a02 * a13 - a03 * a12;
        let b06 = a20 * a31 - a21 * a30;
        let b07 = a20 * a32 - a22 * a30;
        let b08 = a20 * a33 - a23 * a30;
        let b09 = a21 * a32 - a22 * a31;
        let b10 = a21 * a33 - a23 * a31;
        let b11 = a22 * a33 - a23 * a32;

        // Calculate the determinant
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

        if (!det) {
            return null;
        }
        det = 1.0 / det;

        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

        return out;
    }

    static transformMat3ToMat4(m3, out) {
        if (out === undefined) out = Mat4.identity();
        out[0] = m3[0];
        out[1] = m3[1];
        out[2] = m3[2];

        out[4] = m3[3];
        out[5] = m3[4];
        out[6] = m3[5];

        out[8] = m3[6];
        out[9] = m3[7];
        out[10] = m3[8];

        return out;
    }
}