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

    get dataArray(){
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
        if (index * 2 >= this.totalByteLength) {
            this.resize(this.totalByteLength * 2);
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

    resize(length) {
        if (length <= this.totalByteLength) {
            return;
        }
        let oldBuffer = this[_arrayBuffer];
        this[_arrayBuffer] = new ArrayBuffer(length);
        let dv1 = new Uint8Array(oldBuffer);
        let ndv = new Uint8Array(this[_arrayBuffer]);
        ndv.set(dv1, 0);
        this[_dataArray] = new Uint16Array(this[_arrayBuffer]);
    }


    append(indexData) {
        let vertexNum = this.currentIndex;
        let len = indexData.totalByteLength;
        this.resize(len + vertexNum * SINGLE_DATA_BYTE_LENGTH);
        let dv1 = new Uint8Array(indexData.buffer);
        let ndv = new Uint8Array(this.buffer);
        ndv.set(dv1, vertexNum * SINGLE_DATA_BYTE_LENGTH);
        this[_currentIndex] += indexData.currentIndex;
    }
}