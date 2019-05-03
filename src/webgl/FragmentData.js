import Tools from "../utils/Tools.js";

const SINGLE_DATA_BYTE_LENGTH = 16;
/**
 * 0-2 分别是3位uint8类型的颜色数据
 * 3-6: 1位float32的alpha值
 * 7-14：两位float32的贴图坐标值
 * 15：int8类型的贴图索引值
 */
export default class FragmentData {
    constructor(verticesNum) {
        this.buffer = new ArrayBuffer(verticesNum * SINGLE_DATA_BYTE_LENGTH);
        this.dv = new DataView(this.buffer);
        this.currentIndex = 0;
        this.isLittleEndian = Tools.littleEndian;
    }

    get totalByteLength() {
        return this.buffer.byteLength;
    }

    get singleDataByteLength() {
        return SINGLE_DATA_BYTE_LENGTH;
    }

    _checkIndex(index){
        let num = index + 1;
        if (num * SINGLE_DATA_BYTE_LENGTH >= this.totalByteLength) {
            let length = Math.max(num * SINGLE_DATA_BYTE_LENGTH, this.totalByteLength * 2);
            this.increaseSize(length);
        }
    }

    setFragmentOpacity(opacity,index){
        index = index * this.singleDataByteLength;
        index += 4;
        this.dv.setFloat32(index, opacity, this.isLittleEndian);
    }

    setFragmentData(r, g, b, alpha, u, v, textureIndex, filterType, index) {
        index = index * this.singleDataByteLength;
        this.dv.setUint8(index, r);
        this.dv.setUint8(index + 1, g);
        this.dv.setUint8(index + 2, b);
        this.dv.setUint8(index + 3, filterType);
        index += 4;

        this.dv.setFloat32(index, alpha, this.isLittleEndian);
        this.dv.setFloat32(index + 4, u, this.isLittleEndian)
        this.dv.setFloat32(index + 8, v, this.isLittleEndian)
    }

    init() {
        this.currentIndex = 0;
    }


    increaseSize(length) {
        if (length <= this.totalByteLength) {
            return;
        }
        this.resize(length);
    }

    resize(length) {
        let oldBuffer = this.buffer;
        this.buffer = new ArrayBuffer(length);
        let dv1 = new Uint8Array(oldBuffer);
        let ndv = new Uint8Array(this.buffer);
        if (length < oldBuffer.byteLength) {
            for (let i = 0; i < length; i++) {
                ndv[i] = dv1[i];
            }
        } else {
            ndv.set(dv1, 0);
        }
        this.dv = new DataView(this.buffer);
    }

    append(fragmentData) {
        let vertexNum = this.currentIndex;
        let len = fragmentData.currentIndex * fragmentData.singleDataByteLength;
        if (len === 0) return;
        this.increaseSize(len + vertexNum * SINGLE_DATA_BYTE_LENGTH);
        let dv1 = new Uint8Array(fragmentData.buffer);
        let ndv = new Uint8Array(this.buffer);
        let offset = vertexNum * SINGLE_DATA_BYTE_LENGTH;
        for (let i = 0; i < len; i++) {
            ndv[i + offset] = dv1[i];
        }
        this.currentIndex += fragmentData.currentIndex;
    }

    addFragmentData(r, g, b, alpha, u, v, textureIndex, filterType) {
        let index = this.currentIndex;
        this._checkIndex(index);
        this.setFragmentData(r, g, b, alpha, u, v, textureIndex, filterType, index);
        this.currentIndex++;
    }

    copyFrom(fragmentData) {
        let myLen = this.totalByteLength;
        let len = fragmentData.currentIndex * fragmentData.singleDataByteLength;
        if (myLen < len) {
            this.buffer = new ArrayBuffer(len);
            this.dv = new DataView(this.buffer);
        }
        let ndv = new Uint8Array(this.buffer);
        let fdv = new Uint8Array(fragmentData.buffer);
        for (let i = 0; i < len; i++) {
            ndv[i] = fdv[i];
        }
        this.currentIndex = fragmentData.currentIndex;
    }

    fixLength() {
        let realByteLength = this.currentIndex * SINGLE_DATA_BYTE_LENGTH;
        if (realByteLength < this.buffer.byteLength) {
            this.resize(realByteLength);
        }
    }
}