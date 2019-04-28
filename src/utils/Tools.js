const EPSILON = 0.00001;
const PI2 = Math.PI * 2;
const HALFPI = Math.PI / 2;
const PIDIV180 = Math.PI / 180;
const ONE80DIVPI = 180 / Math.PI;
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
            if (obj === array[i]) {
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

    // static collisionResponse(v1, m1, v2, m2, n, e) {
    //     if (e == undefined) e = 1; // 恢复系数默认为1
    //     let m1d = undefined;
    //     let m2d = undefined;
    //     if (m1 == Infinity) {
    //         m2d = 1;
    //         m1d = 0;
    //     }
    //     if (m2 == Infinity) {
    //         m2d = 0;
    //         m1d = 1;
    //     }
    //     if (m1d == undefined && m2d == undefined) {
    //         m1d = 1 / m1;
    //         m2d = 1 / m2;
    //     }
    //     let up = 0 - (1 + e);
    //     let v12 = Vector2.TEMP_VECTORS[0];
    //     v12.x = v1.x - v2.x;
    //     v12.y = v1.y - v2.y;
    //     up = up * Vector2.dot(v12, n);
    //     let tempVector = v12;// {x: n.x, y: n.y};
    //     tempVector.x = n.x;
    //     tempVector.y = n.y;
    //     Vector2.multiplyValue(tempVector, tempVector, (m1d + m2d));
    //     let down = Vector2.dot(n, tempVector);
    //     let j = up / down;
    //
    //     tempVector.x = n.x;
    //     tempVector.y = n.y;
    //     Vector2.multiplyValue(tempVector, tempVector, j * m1d);
    //     let newV1 = {x: 0, y: 0};
    //     Vector2.add(newV1, v1, tempVector);
    //
    //     tempVector.x = n.x;
    //     tempVector.y = n.y;
    //     Vector2.multiplyValue(tempVector, tempVector, j * m2d);
    //     let newV2 = {x: 0, y: 0};
    //     Vector2.sub(newV2, v2, tempVector);
    //
    //     return {newV1: newV1, newV2: newV2};
    // }
    //
    //
    // getProjectionPointOnLine(point, linePoint1, linePoint2) {
    //     let p = point; // 线外一点p
    //     let a = linePoint1; // 线上端点a
    //     let b = linePoint2; // 线上端点b
    //     let ap = new Vector2(p.x - a.x, p.y - a.y);
    //     let ab = new Vector2(b.x - a.x, b.y - a.y);
    //     let abN = Vector2.normalize(ab, ab);//计算出ab的单位向量
    //     let compAP = Vector2.dot(ap, abN);//ap在ab上分量
    //     abN.multiply(compAP); //ap在ab上的投影,返回值就是abN
    //     let p0 = {x: 0, y: 0};
    //     Vector2.plus(p0, a, abN);
    //     return p0;
    // }

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

    static overlaps(bounds1, bounds2) {
        let a = bounds1;
        let b = bounds2;
        return (a.left <= b.right && a.right >= b.left
            && a.bottom >= b.top && a.top <= b.bottom);
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