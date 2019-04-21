let _currentIndex = Symbol('当前顶点游标位置');
let _dataArray = Symbol('Float32的typed数组');
let _arrayBuffer = Symbol('存储顶点数组的buffer');
const SINGLE_DATA_BYTE_LENGTH = 32;
export default class VerticesData {
    constructor(verticesNum) {
        this[_arrayBuffer] = new ArrayBuffer(verticesNum * 4 * 2 * 4);
        this[_dataArray] = new Float32Array(this[_arrayBuffer]);
        this[_currentIndex] = 0;
    }

    get singleDataByteLength() {
        return SINGLE_DATA_BYTE_LENGTH;
    }

    get totalByteLength() {
        return this[_arrayBuffer].byteLength;
    }

    get buffer() {
        return this[_arrayBuffer];
    }

    get currentIndex() {
        return this[_currentIndex];
    }

    init() {
        this[_currentIndex] = 0;
    }

    setVerticesData(x, y, z, nx, ny, nz, index) {
        let num = index + 1;
        index = index * 8;
        if (num * SINGLE_DATA_BYTE_LENGTH >= this.totalByteLength) {
            let length = Math.max(num * SINGLE_DATA_BYTE_LENGTH, this.totalByteLength * 2);
            this.increaseSize(length);
        }
        this[_dataArray][index] = x;
        this[_dataArray][index + 1] = y;
        this[_dataArray][index + 2] = z;

        this[_dataArray][index + 4] = nx;
        this[_dataArray][index + 5] = ny;
        this[_dataArray][index + 6] = nz;
    }

    setVerticesCoor(x, y, z, index) {
        let num = index + 1;
        index = index * 8;
        if (num * SINGLE_DATA_BYTE_LENGTH >= this.totalByteLength) {
            let length = Math.max(num * SINGLE_DATA_BYTE_LENGTH, this.totalByteLength * 2);
            this.increaseSize(length);
        }
        this[_dataArray][index] = x;
        this[_dataArray][index + 1] = y;
        this[_dataArray][index + 2] = z;
    }

    getVerticesData(index) {
        index = index * 8;
        let x = this[_dataArray][index];
        let y = this[_dataArray][index + 1];
        let z = this[_dataArray][index + 2];

        let nx = this[_dataArray][index + 4];
        let ny = this[_dataArray][index + 5];
        let nz = this[_dataArray][index + 6];

        return [x, y, z, nx, ny, nz];
    }

    getVerticesPositionData(index) {
        index = index * 8;
        let x = this[_dataArray][index];
        let y = this[_dataArray][index + 1];
        let z = this[_dataArray][index + 2];
        return [x, y, z];
    }

    getVerticesPositionXData(index) {
        index = index * 8;
        return this[_dataArray][index];
    }

    getVerticesPositionYData(index) {
        index = index * 8;
        return this[_dataArray][index + 1];
    }

    getVerticesPositionZData(index) {
        index = index * 8;
        return this[_dataArray][index + 2];
    }

    getVerticesNormalData(index) {
        index = index * 8;
        let nx = this[_dataArray][index + 4];
        let ny = this[_dataArray][index + 5];
        let nz = this[_dataArray][index + 6];
        return [nx, ny, nz];
    }

    getVerticesNormalXData(index) {
        index = index * 8;
        return this[_dataArray][index + 4];
    }

    getVerticesNormalYData(index) {
        index = index * 8;
        return this[_dataArray][index + 5];
    }

    getVerticesNormalZData(index) {
        index = index * 8;
        return this[_dataArray][index + 6];
    }

    addVerticesData(x, y, z, nx, ny, nz) {
        let index = this[_currentIndex];
        this.setVerticesData(x, y, z, nx, ny, nz, index);
        this[_currentIndex]++;
    }

    increaseSize(length) {
        if (length === 0) return;
        if (length <= this.totalByteLength) {
            return;
        }
        this.resize(length);
    }

    resize(length) {
        let oldBuffer = this[_arrayBuffer];
        this[_arrayBuffer] = new ArrayBuffer(length);
        let dv1 = new Uint8Array(oldBuffer);
        let ndv = new Uint8Array(this[_arrayBuffer]);
        if (length < oldBuffer.byteLength) {
            for (let i = 0; i < length; i++) {
                ndv[i] = dv1[i];
            }
        } else {
            ndv.set(dv1, 0);
        }

        this[_dataArray] = new Float32Array(this[_arrayBuffer]);
    }

    append(verticesData) {
        let vertexNum = this.currentIndex;
        let len = verticesData.currentIndex * verticesData.singleDataByteLength;
        if (len === 0) return;
        this.increaseSize(len + vertexNum * SINGLE_DATA_BYTE_LENGTH);
        let dv1 = new Uint8Array(verticesData.buffer);
        let ndv = new Uint8Array(this[_arrayBuffer]);
        let offset = vertexNum * SINGLE_DATA_BYTE_LENGTH;
        for (let i = 0; i < len; i++) {
            ndv[i + offset] = dv1[i];
        }
        this[_currentIndex] += verticesData.currentIndex;
    }

    copyFrom(verticesData) {
        let myLen = this.totalByteLength;
        let len = verticesData.currentIndex * verticesData.singleDataByteLength;
        if (myLen < len) {
            this[_arrayBuffer] = new ArrayBuffer(len);
            this[_dataArray] = new Float32Array(this[_arrayBuffer]);
        }
        let ndv = new Uint8Array(this[_arrayBuffer]);
        let fdv = new Uint8Array(verticesData.buffer);
        for (let i = 0; i < len; i++) {
            ndv[i] = fdv[i];
        }
        // ndv.set(fdv, 0);
        this[_currentIndex] = verticesData.currentIndex;
    }

    fixLength() {
        let realByteLength = this.currentIndex * SINGLE_DATA_BYTE_LENGTH;
        if (realByteLength < this.buffer.byteLength) {
            this.resize(realByteLength);
        }
    }
}