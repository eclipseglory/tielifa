/*
 * Copyright (c) 2018. 老脸叔叔创建，版权归老脸叔叔所有
 */


import Tools from "../utils/Tools.js";

let _value = Symbol('二维向量值数组,0是x，1是y');
// 这是一个可以临时使用的vector数组，便于计算的时候不浪费内存
let TEMP_VECTORS = undefined;
export default class Vector2 {
    get x() {
        return this[_value][0];
    }

    set x(value) {
        this[_value][0] = value;
    }

    get y() {
        return this[_value][1];
    }

    set y(value) {
        this[_value][1] = value;
    }

    get value() {
        return this[_value];
    }

    set value(value) {
        this[_value][0] = value[0];
        this[_value][1] = value[1];
    }

    get radian() {
        return Math.atan2(this.y, this.x);
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // static vectorAngle(fromVector, toVector) {
    //     return Math.atan2(toVector.y - fromVector.y, toVector.x - fromVector.x);
    // }

    static rotate(out, sourceVector, radian) {
        let cos = Math.cos(radian), sin = Math.sin(radian);
        if (!out) out = {x: 0, y: 0};
        let y = sourceVector.x * sin + sourceVector.y * cos;
        let x = sourceVector.x * cos - sourceVector.y * sin;
        out.x = x;
        out.y = y;
        return out;
    }

    static rotateAbout(output, vector, rotatePoint, radian) {
        let c = Math.cos(radian);
        let s = Math.sin(radian);
        if (!output) output = {};
        output.x = rotatePoint.x + ((vector.x - rotatePoint.x) * c - (vector.y - rotatePoint.y) * s);
        output.y = rotatePoint.y + ((vector.x - rotatePoint.x) * s + (vector.y - rotatePoint.y) * c);
        return output;
    }

    static get TEMP_VECTORS() {
        if (TEMP_VECTORS == undefined) {
            TEMP_VECTORS = [new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0)];
        }
        return TEMP_VECTORS;
    }

    static normalize(out, vector) {
        let magnitude = vector.magnitude;
        if (out == undefined) out = vector.clone();
        else {
            if (out != vector) {
                out.x = vector.x;
                out.y = vector.y;
            }
        }
        if (magnitude == 0) {
            out.x = 0;
            out.y = 0;
            return out;
        }
        out.x = out.x / magnitude;
        out.y = out.y / magnitude;
        return out;
    }

    static multiplyValue(out, v, value) {
        let v1 = v.x * value;
        let v2 = v.y * value;
        out.x = v1;
        out.y = v2;
    }

    static dot(v1, v2) {
        return (v1.x * v2.x + v1.y * v2.y);
    }

    static cross(v1, v2) {
        return (v1.x * v2.y) - (v1.y * v2.x);
    }

    static crossZ(out, v, z) {
        // A x B = (AyBz - AzBy , AzBx - AxBz , AxBy - AyBx)
        // 所以把这个二维向量看成(Vx,Vy,0),这个z就是(0,0,z)，得到：
        out.x = v.y * z;
        out.y = -(v.x * z);
        return out;
    }

    static zCrossVector(out, z, v) {
        out.x = -z * v.y;
        out.y = z * v.x;
        return out;
    }


    static plus(out, v1, v2) {
        out.x = v1.x + v2.x;
        out.y = v1.y + v2.y;
        return out;
    }

    static sub(out, v1, v2) {
        out.x = v1.x - v2.x;
        out.y = v1.y - v2.y;
        return out;
    }

    constructor(x, y) {
        this[_value] = new Float32Array(3);
        // this[_value] = [0, 0, 1];//多一位是免得和mat计算时还要自动加一个
        if (x != null || x != undefined)
            this.x = x;
        if (y != null || y != undefined)
            this.y = y;
        this[_value][2] = 1;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    multiply(value) {
        this.x *= value;
        this.y *= value;
        return this;
    }

    split(radian1, radian2) {
        var maxRadian = Math.max(radian1, radian2);
        var minRadian = Math.min(radian1, radian2);
        console.log(maxRadian, minRadian);
        var nr = Math.PI - (maxRadian - minRadian);
        var d = this.magnitude / Math.sin(nr);
        var nr2 = maxRadian - this.radian;
        var nr1 = Math.PI - nr2 - nr;
        var value1 = d * Math.sin(nr1);
        var value2 = d * Math.sin(nr2);
        var vectorMax = Vector2.createVector(value2, minRadian);
        var vectorMin = Vector2.createVector(value1, maxRadian);
        vectorMax.add(vectorMin);
    }

    splitWithRightAngle(horizontalRadian) {
        this.rotate(-horizontalRadian);
        let hVector = new Vector2(this.x, 0);
        let vVector = new Vector2(0, this.y);
        hVector.rotate(horizontalRadian);
        vVector.rotate(horizontalRadian);
        this.rotate(horizontalRadian);
        return {hVector: hVector, vVector: vVector};
    }

    reverse() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    rotate(radian) {
        let nradian = this.radian + radian;
        let value = this.magnitude;
        this.x = Math.abs(value) * Math.cos(nradian);
        this.y = Math.abs(value) * Math.sin(nradian);
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    static createVector(value, radian) {
        let x = Math.abs(value) * Math.cos(radian);
        if (Math.abs(x) < Tools.EPSILON) {
            x = 0;
        }
        let y = Math.abs(value) * Math.sin(radian);
        if (Math.abs(y) < Tools.EPSILON) {
            y = 0;
        }
        return new Vector2(x, y);
    }
}
