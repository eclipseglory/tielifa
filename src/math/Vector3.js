import Tools from "../utils/Tools.js";

let temp = undefined;
export default class Vector3 {
    constructor(x, y, z) {
        this.value = new Float32Array(4);
        // this.value = [0, 0, 0, 1];//多一位是免得和mat计算时还要自动加一个
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.value[3] = 1;
    }

    get x() {
        return this.value[0];
    }

    set x(v) {
        this.value[0] = v;
    }

    get y() {
        return this.value[1];
    }

    set y(v) {
        this.value[1] = v;
    }

    get z() {
        return this.value[2];
    }

    set z(v) {
        this.value[2] = v;
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    static normalize(out, v) {
        let length = v.magnitude;
        if (Tools.equals(0, length)) {
            out.x = 0;
            out.y = 0;
            out.z = 0;
        } else {
            out.x = v.x / length;
            out.y = v.y / length;
            out.z = v.z / length;
            // if(Tools.equals(out.x , 0))out.x = 0;
            // if(Tools.equals(out.y , 0))out.y = 0;
            // if(Tools.equals(out.z , 0))out.z = 0;
        }
    }

    static plus(out, v1, v2) {
        out.x = v1.x + v2.x;
        out.y = v1.y + v2.y;
        out.z = v1.z + v2.z;
        return out;
    }

    static multiplyValue(out, v, value) {
        out.x = v.x * value;
        out.y = v.y * value;
        out.z = v.z * value;
        return out;
    }

    static get TEMP_VECTORS() {
        if (temp == undefined) {
            temp = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
        }
        return temp;
    }

    static copy(from,to){
        to.x = from.x;
        to.y = from.y;
        to.z = from.z;
    }

    static cross(out, v1, v) {
        out.x = v1.y * v.z - v1.z * v.y;
        out.y = v1.z * v.x - v1.x * v.z;
        out.z = v1.x * v.y - v1.y * v.x;
        return out;
    }
}