let _currentIndex = Symbol('当前顶点游标位置');
let _dataArray = Symbol('Int16的typed数组');
let _arrayBuffer = Symbol('存储顶点数组的buffer');
const SINGLE_DATA_BYTE_LENGTH = 2;
export default class IndexData {
    constructor(vertexNumber) {
        this[_arrayBuffer] = new ArrayBuffer(vertexNumber * 2);
        this[_dataArray] = new Uint16Array(this[_arrayBuffer]);
        this[_currentIndex] = 0;
    }

    get dataArray() {
        return this[_dataArray];
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

    setIndex(indexData, index) {
        let num = index + 1;
        if (num * 2 >= this.totalByteLength) {
            let length = Math.max(num * 2, this.totalByteLength * 2);
            this.increaseSize(length);
        }
        this[_dataArray][index] = indexData;
    }

    getIndex(index) {
        return this[_dataArray][index];
    }

    addIndex(indexData) {
        let index = this[_currentIndex];
        this.setIndex(indexData, index);
        this[_currentIndex]++;
    }

    increaseSize(length) {
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
        this[_dataArray] = new Uint16Array(this[_arrayBuffer]);
    }


    append(indexData) {
        // let vertexNum = this.currentIndex;
        // let len = indexData.totalByteLength;
        // this.increaseSize(len + vertexNum * SINGLE_DATA_BYTE_LENGTH);
        // let dv1 = new Uint8Array(indexData.buffer);
        // let ndv = new Uint8Array(this.buffer);
        // ndv.set(dv1, vertexNum * SINGLE_DATA_BYTE_LENGTH);
        // this[_currentIndex] += indexData.currentIndex;

        let vertexNum = this.currentIndex;
        let len = indexData.currentIndex * indexData.singleDataByteLength;
        if (len === 0) return;
        this.increaseSize(len + vertexNum * SINGLE_DATA_BYTE_LENGTH);
        let dv1 = new Uint8Array(indexData.buffer);
        let ndv = new Uint8Array(this[_arrayBuffer]);
        let offset = vertexNum * SINGLE_DATA_BYTE_LENGTH;
        for (let i = 0; i < len; i++) {
            ndv[i + offset] = dv1[i];
        }
        this[_currentIndex] += indexData.currentIndex;
    }

    copyFrom(indexData) {
        let myLen = this.totalByteLength;
        let len = indexData.currentIndex * indexData.singleDataByteLength;
        if (myLen < len) {
            this[_arrayBuffer] = new ArrayBuffer(len);
            this[_dataArray] = new Uint16Array(this[_arrayBuffer]);
        }
        let ndv = new Uint8Array(this[_arrayBuffer]);
        let fdv = new Uint8Array(indexData.buffer);
        for (let i = 0; i < len; i++) {
            ndv[i] = fdv[i];
        }
        this[_currentIndex] = indexData.currentIndex;
    }

    fixLength() {
        let realByteLength = this.currentIndex * SINGLE_DATA_BYTE_LENGTH;
        if (realByteLength < this.buffer.byteLength) {
            this.resize(realByteLength);
        }
    }
}