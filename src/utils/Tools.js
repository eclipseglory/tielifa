import Mat4 from "../math/Mat4.js";
import Mat3 from "../math/Mat3.js";

const EPSILON = 0.00001;
const PI2 = Math.PI * 2;
const HALFPI = Math.PI / 2;
const PIDIV180 = Math.PI / 180;
const ONE80DIVPI = 180 / Math.PI;
const TEMP_TRANFORM_MAT3 = Mat3.identity();

const TEMP_VERTEX_COORD4DIM_ARRAY = new Float32Array(4);
TEMP_VERTEX_COORD4DIM_ARRAY[3] = 1;

let littleEndian = undefined;
export default class Tools {
    constructor() {
        this.instance = null;
    }

    static get HALFPI() {
        return HALFPI;
    }

    static get ONE80DIVPI() {
        return ONE80DIVPI;
    }

    static get PIDIV180() {
        return PIDIV180;
    }

    static get PI2() {
        return PI2;
    }

    static get EPSILON() {
        return EPSILON;
    }

    static equals(a, b) {
        // return Math.abs(a - b) <= EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
        return Math.abs(a - b) <= EPSILON;
    }

    static createReadOnlyObject(input, out) {
        for (let p in input) {
            let v = input[p];
            let v1 = v;
            if (typeof v1 == 'object') {
                v1 = {};
                this.createReadOnlyObject(v, v1);
            }
            Object.defineProperty(out, p, {
                get: function () {
                    return v1;
                }
            });
        }
    }

    static insertSort(array) {
        let n = array.length;
        if (n <= 1) {
            return array;
        }
        for (let i = 1; i < n; i++) {
            let temp = array[i];
            let j = i - 1;
            for (; j >= 0; j--) {
                if (array[j] > temp) {
                    array[j + 1] = array[j]; // 比temp 大的已排序数据后移一位
                } else {
                    break;
                }
            }
            array[j + 1] = temp; // 空出来的位置，把temp放进去
        }
        return array;
    }

    static removeObjFromArray(obj, array) {
        for (let i = 0; i < array.length; i++) {
            if (obj == array[i]) {
                array.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    static addAllInArray(array, array2) {
        for (let i = 0; i < array2.length; i++) {
            array.push(array2[i]);
        }
    }

    static get littleEndian() {
        if (littleEndian === undefined) {
            // DataView是默认按照高位存放，这里要做判断，更改存放顺序
            let arrayBuffer = new ArrayBuffer(2);
            let uint8Array = new Uint8Array(arrayBuffer);
            let uint16array = new Uint16Array(arrayBuffer);
            uint8Array[0] = 0xAA; // 第一位是AA
            uint8Array[1] = 0xBB; // 第二位是BB
            // 如果从16的view中读取数据，按照其排序就能得出高低位，以便DataView在设置值的时候能正确
            if (uint16array[0] === 0xBBAA) littleEndian = true;
            if (uint16array[0] === 0xAABB) littleEndian = false;
        }
        return littleEndian;
    }

    static getDistance(point1, point2) {
        let dx = point1.x - point2.x;
        let dy = point1.y - point2.y;
        let dz = 0;
        if (point1.z != undefined && point2.z != undefined) {
            dz = point1.z - point2.z;
        }
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    static applyTransformForVDO(matrix, vdo, out) {
        // TODO 这里需要使用矩阵的逆矩阵的转至矩阵求法向量，我没做
        if (out == null) out = vdo;
        Mat4.mat4ToMat3(matrix, TEMP_TRANFORM_MAT3);
        let _normalTransformMatrix = TEMP_TRANFORM_MAT3;
        //这里的数据需要从最开始记录的原始数据中进行计算：
        let verticesData = vdo.verticesData;
        let targetVerticesData = out.verticesData;
        let _tempVertices = TEMP_VERTEX_COORD4DIM_ARRAY;
        for (let i = 0; i < verticesData.currentIndex; i++) {
            _tempVertices[0] = verticesData.getVerticesPositionXData(i);
            _tempVertices[1] = verticesData.getVerticesPositionYData(i);
            _tempVertices[2] = verticesData.getVerticesPositionZData(i);
            Mat4.multiplyWithVertex(matrix, _tempVertices, _tempVertices);
            let x = _tempVertices[0];
            let y = _tempVertices[1];
            let z = _tempVertices[2];

            _tempVertices[0] = verticesData.getVerticesNormalXData(i);
            _tempVertices[1] = verticesData.getVerticesNormalYData(i);
            _tempVertices[2] = verticesData.getVerticesNormalZData(i);
            Mat3.multiplyWithVertex(_tempVertices, _normalTransformMatrix, _tempVertices);
            targetVerticesData.setVerticesData(x, y, z, _tempVertices[0], _tempVertices[1], _tempVertices[2], i);
        }
    }

    static clamp(value, min, max) {
        if (value > max) {
            return max;
        }
        if (value < min) {
            return min;
        }
        return value;
    }

    static getInsance() {
        if (this.instance == null) {
            this.instance = new Tools();
        }
        return this.instance;
    }

    static overlaps(bounds1, bounds2, equals) {
        let a = bounds1;
        let b = bounds2;
        if (equals == null || equals == true)
            return (a.left <= b.right && a.right >= b.left
                && a.bottom >= b.top && a.top <= b.bottom);
        else
            return (a.left < b.right && a.right > b.left
                && a.bottom > b.top && a.top < b.bottom);
    }


    static isHit(rect1, rect2) {
        var result = false;
        var x = rect1.left;
        var y = rect1.top;
        if (Tools.isInTheRect(x, y, rect2)) {
            result = true;
        }
        x = rect1.left;
        y = rect1.top + rect1.height;
        if (Tools.isInTheRect(x, y, rect2)) {
            result = true;
        }
        x = rect1.left + rect1.width;
        y = rect1.top;
        if (Tools.isInTheRect(x, y, rect2)) {
            result = true;
        }

        x = rect1.left + rect1.width;
        y = rect1.top + rect1.height;
        if (Tools.isInTheRect(x, y, rect2)) {
            result = true;
        }
        if (!result) {
            x = rect2.left;
            y = rect2.top;
            if (Tools.isInTheRect(x, y, rect1)) {
                result = true;
            }
            x = rect2.left;
            y = rect2.top + rect2.height;
            if (Tools.isInTheRect(x, y, rect1)) {
                result = true;
            }
            x = rect2.left + rect2.width;
            y = rect2.top;
            if (Tools.isInTheRect(x, y, rect1)) {
                result = true;
            }

            x = rect2.left + rect2.width;
            y = rect2.top + rect2.height;
            if (Tools.isInTheRect(x, y, rect1)) {
                result = true;
            }
        }
        return result;
    }

    static isInTheRect(x, y, rect) {
        var fx = rect.left;
        var fy = rect.top;
        var currentWidth = rect.width;
        var currentHeight = rect.height;
        if (x > fx && x < fx + currentWidth && y > fy && y < fy + currentHeight) {
            return true;
        }
        return false;
    }
}