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
        index = index * 8;
        if (index * 4 >= this.totalByteLength) {
            this.resize(this.totalByteLength * 2);
        }
        this[_dataArray][index] = x;
        this[_dataArray][index + 1] = y;
        this[_dataArray][index + 2] = z;

        this[_dataArray][index + 4] = nx;
        this[_dataArray][index + 5] = ny;
        this[_dataArray][index + 6] = nz;
    }

    setVerticesCoor(x, y, z, index) {
        index = index * 8;
        if (index * 4 >= this.totalByteLength) {
            this.resize(this.totalByteLength * 2);
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

    getVerticesNormalData(index) {
        index = index * 8;
        let nx = this[_dataArray][index + 4];
        let ny = this[_dataArray][index + 5];
        let nz = this[_dataArray][index + 6];
        return [nx, ny, nz];
    }

    addVerticesData(x, y, z, nx, ny, nz) {
        let index = this[_currentIndex];
        this.setVerticesData(x, y, z, nx, ny, nz, index);
        this[_currentIndex]++;
    }

    resize(length) {
        if (length <= this.totalByteLength) {
            return;
        }
        let oldBuffer = this[_arrayBuffer];
        this[_arrayBuffer] = new ArrayBuffer(length);
        let dv1 = new Uint8Array(oldBuffer);
        let ndv = new Uint8Array(this[_arrayBuffer]);
        ndv.set(dv1, 0);
        this[_dataArray] = new Float32Array(this[_arrayBuffer]);
    }

    append(verticesData) {
        let vertexNum = this.currentIndex;
        let len = verticesData.totalByteLength;
        this.resize(len + vertexNum * SINGLE_DATA_BYTE_LENGTH);
        let dv1 = new Uint8Array(verticesData.buffer);
        let ndv = new Uint8Array(this[_arrayBuffer]);
        ndv.set(dv1, vertexNum * SINGLE_DATA_BYTE_LENGTH);
        this[_currentIndex] += verticesData.currentIndex;
    }
}