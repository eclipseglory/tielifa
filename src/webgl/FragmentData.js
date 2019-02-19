import BaseBufferData from "./BaseBufferData.js";
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

    resize(length) {
        if (length <= this.totalByteLength) {
            return;
        }
        let oldBuffer = this.buffer;
        this.buffer = new ArrayBuffer(length);
        let dv1 = new Uint8Array(oldBuffer);
        let ndv = new Uint8Array(this.buffer);
        ndv.set(dv1, 0);
        this.dv = new DataView(this.buffer);
    }

    append(fragmentData) {
        let vertexNum = this.currentIndex;
        let len = fragmentData.totalByteLength;
        this.resize(len + vertexNum * SINGLE_DATA_BYTE_LENGTH);
        let dv1 = new Uint8Array(fragmentData.buffer);
        let ndv = new Uint8Array(this.buffer);
        ndv.set(dv1, vertexNum * SINGLE_DATA_BYTE_LENGTH);
        this.currentIndex += fragmentData.currentIndex;
    }

    addFragmentData(r, g, b, alpha, u, v, textureIndex, filterType) {
        let index = this.currentIndex;
        if (index * this.singleDataByteLength >= this.totalByteLength) {
            this.resize(this.totalByteLength * 2);
        }
        this.setFragmentData(r, g, b, alpha, u, v, textureIndex, filterType, index);
        this.currentIndex++;
    }
}