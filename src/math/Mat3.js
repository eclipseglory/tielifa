let temp_mat3Array = undefined;
export default class Mat3 {
    constructor() {

    }

    static get TEMP_MAT3() {
        if (temp_mat3Array == undefined) {
            temp_mat3Array = [
                Mat3.identity(), Mat3.identity(), Mat3.identity(), Mat3.identity()
            ];
        }
        return temp_mat3Array;
    }

    static projection(width, height) {
        let m = this.identity();
        m[0] = 2 / width;
        m[4] = -2 / height;
        m[6] = -1;
        m[7] = 1;
        m[8] = 1;
        return m;
    }

    static identity(out) {
        if (out == undefined) {
            // out = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            out = new Float32Array(9);
            out[0] = 1;
            out[4] = 1;
            out[8] = 1;
        } else {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 1;
            out[5] = 0;
            out[6] = 0;
            out[7] = 0;
            out[8] = 1;
        }
        return out;
    }

    static translate(out, tx, ty) {
        let x, y, m;
        if (arguments.length == 3) {
            m = out;
            this.identity(m);
            x = tx;
            y = ty;
        }
        if (arguments.length == 2) {
            x = out;
            y = tx;
            m = this.identity();
        }
        m[6] = x;
        m[7] = y;
        return m;
    }

    static rotate(out, radian) {
        let theta, m;
        if (arguments.length == 2) {
            m = out;
            this.identity(m);
            theta = radian;
        }
        if (arguments.length == 1) {
            theta = out;
            m = this.identity();
        }
        let c = Math.cos(theta);
        let s = Math.sin(theta);
        m[0] = c;
        m[1] = s;
        m[3] = -s;
        m[4] = c;
        return m;
    }

    static scale(out, sx, sy) {
        let x, y, m;
        if (arguments.length == 3) {
            m = out;
            this.identity(m);
            x = sx;
            y = sy;
        }
        if (arguments.length == 2) {
            x = out;
            y = sx;
            m = this.identity();
        }
        m[0] = x;
        m[4] = y;
        return m;
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
    }

    static multiplyWithVertex(outMatrix, matrix, v2) {
        let m;
        let out;
        let vertex;
        if (arguments.length == 3) {
            m = matrix;
            out = outMatrix;
            vertex = v2;
        }
        if (arguments.length == 2) {
            m = outMatrix;
            vertex = matrix;
        }
        if (out == null) out = Mat3.identity();
        let a00 = m[0], a01 = m[1], a02 = m[2];
        let a10 = m[3], a11 = m[4], a12 = m[5];
        let a20 = m[6], a21 = m[7], a22 = m[8];

        let b0 = vertex[0], b1 = vertex[1], b2 = vertex[2];
        if (b2 == null) b2 = 1;

        out[0] = b0 * a00 + b1 * a10 + b2 * a20;
        out[1] = b0 * a01 + b1 * a11 + b2 * a21;
        out[2] = b0 * a02 + b1 * a12 + b2 * a22;
        return out;
    }

    static rotateMatrix(out, m) {
        let a00 = m[0], a01 = m[1] , a02=m[2];
        let a10 = m[3], a11 = m[4] , a12=m[5];
        let a20 = m[6], a21 = m[7] , a22=m[8];

        out[0] = a00;
        out[1] = a10;
        out[2] = a20;

        out[3] = a01;
        out[4] = a11;
        out[5] = a21;

        out[6] = a02;
        out[7] = a12;
        out[8] = a22;
        // let a00 = m[0];
        // let a00 = m[0];
        // let a00 = m[0];
        // let a00 = m[0];
        // let a00 = m[0];
        // let a00 = m[0];
        // let a00 = m[0];
        // let a00 = m[0];

    }

    static multiplyWithValue(out, m, value) {
        out[0] = m[0] * value;
        out[1] = m[1] * value;
        out[2] = m[2] * value;
        out[3] = m[3] * value;
        out[4] = m[4] * value;
        out[5] = m[5] * value;
        out[6] = m[6] * value;
        out[7] = m[7] * value;
        out[8] = m[8] * value;
    }

    static plus(out, m1, m2) {
        out[0] = m1[0] + m2[0];
        out[1] = m1[1] + m2[1];
        out[2] = m1[2] + m2[2];
        out[3] = m1[3] + m2[3];
        out[4] = m1[4] + m2[4];
        out[5] = m1[5] + m2[5];
        out[6] = m1[6] + m2[6];
        out[7] = m1[7] + m2[7];
        out[8] = m1[8] + m2[8];
    }

    static multiply(out, a, b) {

        let a00 = a[0], a01 = a[1], a02 = a[2];
        let a10 = a[3], a11 = a[4], a12 = a[5];
        let a20 = a[6], a21 = a[7], a22 = a[8];

        let b00 = b[0], b01 = b[1], b02 = b[2];
        let b10 = b[3], b11 = b[4], b12 = b[5];
        let b20 = b[6], b21 = b[7], b22 = b[8];

        out[0] = b00 * a00 + b01 * a10 + b02 * a20;
        out[1] = b00 * a01 + b01 * a11 + b02 * a21;
        out[2] = b00 * a02 + b01 * a12 + b02 * a22;

        out[3] = b10 * a00 + b11 * a10 + b12 * a20;
        out[4] = b10 * a01 + b11 * a11 + b12 * a21;
        out[5] = b10 * a02 + b11 * a12 + b12 * a22;

        out[6] = b20 * a00 + b21 * a10 + b22 * a20;
        out[7] = b20 * a01 + b21 * a11 + b22 * a21;
        out[8] = b20 * a02 + b21 * a12 + b22 * a22;
        return out;
    }
}