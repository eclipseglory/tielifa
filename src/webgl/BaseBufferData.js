
const TYPE_FLOAT32 = 4;
const TYPE_FLOAT64 = 8;
const TYPE_UINT8 = 2;
const TYPE_UINT16 = 3;
const TYPE_UINT32 = 0;
const TYPE_INT8 = 5;
const TYPE_INT16 = 6;
const TYPE_INT32 = 7;
const TYPE_UINT8CLAMPED = 1;

let littleEndian = undefined;
export default class BaseBufferData {
    constructor(dataNum, singleDataByteLength) {
        this.singleDataByteLength = singleDataByteLength;
        this.buffer = new ArrayBuffer(dataNum * singleDataByteLength);
        this.dv = new DataView(this.buffer);
        this.currentIndex = 0;
        this.isLittleEndian = BaseBufferData.littleEndian();
    }

    init() {
        this.currentIndex = 0;
    }

    static littleEndian() {
        if (littleEndian == undefined) {
            let arrayBuffer = new ArrayBuffer(2);
            let uint8Array = new Uint8Array(arrayBuffer);
            let uint16array = new Uint16Array(arrayBuffer);
            uint8Array[0] = 0xAA; // 第一位是AA
            uint8Array[1] = 0xBB; // 第二位是BB
            // 如果从16的view中读取数据，按照其排序就能得出高低位，以便DataView在设置值的时候能正确
            if (uint16array[0] === 0xBBAA) littleEndian = true;
            if (uint16array[0] === 0xAABB) littleEndian = false;
            return littleEndian;
        } else {
            return littleEndian;
        }
    }

    get totalByteLength() {
        return this.buffer.byteLength;
    }


    getData(index, type, offset) {
        index = index * this.singleDataByteLength;
        if (type == undefined) type = TYPE_FLOAT32;
        if (offset == undefined) offset = 0;
        index += offset;
        let littleEndian = this.isLittleEndian;
        switch (type) {
            case TYPE_FLOAT64 :
                return this.dv.getFloat64(index, littleEndian);
                break;
            case TYPE_UINT8CLAMPED:
                return this.dv.getUint8(index);
                break;
            case TYPE_INT8 :
                return this.dv.getInt8(index);
                break;
            case TYPE_UINT8 :
                return this.dv.getUint8(index);
                break;
            case TYPE_INT16 :
                return this.dv.getInt16(index, littleEndian);
                break;
            case TYPE_UINT16 :
                return this.dv.getUint16(index, littleEndian);
                break;
            case TYPE_FLOAT32 :
                return this.dv.getFloat32(index, littleEndian);
                break;
            case TYPE_INT32 :
                return this.dv.getInt32(index, littleEndian);
                break;
            case TYPE_UINT32 :
                return this.dv.getUint32(index, littleEndian);
                break;
        }
    }

    setData(value, index, type, offset) {
        let littleEndian = this.isLittleEndian;
        if (offset == undefined) offset = 0;
        if (type == undefined) type = TYPE_FLOAT32;
        index = index * this.singleDataByteLength;
        index += offset;
        switch (type) {
            case TYPE_FLOAT64 :
                this.dv.setFloat64(index, value, littleEndian);
                break;
            case TYPE_UINT8CLAMPED:
                this.dv.setUint8(index, value);
                break;
            case TYPE_INT8 :
                this.dv.setInt8(index, value);
                break;
            case TYPE_UINT8 :
                this.dv.setUint8(index, value);
                break;
            case TYPE_INT16 :
                this.dv.setInt16(index, value, littleEndian);
                break;
            case TYPE_UINT16 :
                this.dv.setUint16(index, value, littleEndian);
                break;
            case TYPE_FLOAT32 :
                this.dv.setFloat32(index, value, littleEndian);
                break;
            case TYPE_INT32 :
                this.dv.setInt32(index, value, littleEndian);
                break;
            case TYPE_UINT32 :
                this.dv.setUint32(index, value, littleEndian);
                break;
        }
    }

    resize(length) {
        if (length < this.totalByteLength) throw Error('new length should not less than old length');
        let oldBuffer = this.buffer;
        this.buffer = new ArrayBuffer(length);
        let dv1 = new Uint8Array(oldBuffer);
        let ndv = new Uint8Array(this.buffer);
        ndv.set(dv1, 0);
        this.dv = new DataView(this.buffer);
    }


    static get TYPE_FLOAT32() {
        return TYPE_FLOAT32;
    }

    static get TYPE_FLOAT64() {
        return TYPE_FLOAT64;
    }

    static get TYPE_UINT8() {
        return TYPE_UINT8;
    }

    static get TYPE_UINT16() {
        return TYPE_UINT16;
    }

    static get TYPE_UINT32() {
        return TYPE_UINT32;
    }

    static get TYPE_INT8() {
        return TYPE_INT8;
    }

    static get TYPE_INT16() {
        return TYPE_INT16;
    }

    static get TYPE_INT32() {
        return TYPE_INT32;
    }

    static get TYPE_UINT8CLAMPED() {
        return TYPE_UINT8CLAMPED;
    }
}