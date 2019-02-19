import BaseBufferData from "./BaseBufferData.js";

const SINGLE_DATA_BYTE_LENGTH = 4;
export default class TransformMatrixData extends BaseBufferData{
    constructor(verticesNum) {
        // 1位是float32类型，矩阵索引
        super(verticesNum,SINGLE_DATA_BYTE_LENGTH)
    }

    setMatrixIndex(mIndex, index) {
        this.setData(mIndex,index);
    }
    addMatrixIndex(mIndex) {
        let index = this.currentIndex;
        if (index * this.singleDataByteLength >= this.totalByteLength) {
            this.resize(this.totalByteLength * 2);
        }
        this.setMatrixIndex(mIndex, index);
        this.currentIndex++;
    }
    getMatrixIndex(index) {
        return this.getData(index);
    }
}