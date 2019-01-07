const MAX_SINGLE_BYTE_LENGTH = 32 * 6 * 100; // 默认buffer长度就是100个矩形的长度
const TYPE_FLOAT32 = 4;
const TYPE_FLOAT64 = 8;
const TYPE_UINT8 = 2;
const TYPE_UINT16 = 3;
const TYPE_UINT32 = 0;
const TYPE_INT8 = 5;
const TYPE_INT16 = 6;
const TYPE_INT32 = 7;
const TYPE_UINT8CLAMPED = 1;
let _currentByteIndex = Symbol('当前buffer数据所在的字节索引');
let _singleDataFragmentSize = Symbol('单个数据块字节大小');
let _dataStructure = Symbol('ArrayBuffer的数据存放结构');
let _currentStructureIndex = Symbol('当前所在结构中的索引');
let littleEndian = undefined; // DataView是否是按照低位存放
export default class DataBuffer {
    constructor(dataStructure, length) {
        if (length === undefined) length = MAX_SINGLE_BYTE_LENGTH;
        this.buffer = new ArrayBuffer(length);
        this.dv = new DataView(this.buffer);
        this.byteDv = new Uint8Array(this.buffer);
        this[_dataStructure] = dataStructure;
        let that = this;
        let initDataStructure = function (dataStructure) {
            if (dataStructure === undefined || dataStructure === null) {
                // 如果没有设置数据结构，那就默认是单个float32进行添加
                console.warn("DataStructure没有指定，默认单个float32数据进行存放。DataStructure必须是一个数组，其内部结构为 [...{type:type,count:count,byteSize:size},...]");
                that[_singleDataFragmentSize] = 4;
                that[_dataStructure] = undefined;
                return;
            } else {
                if (!(dataStructure instanceof Array)) {
                    console.warn("DataStructure必须是一个数组，其内部结构为 [...{type:type,count:count,byteSize:size},...]");
                    that[_singleDataFragmentSize] = 4;
                    that[_dataStructure] = undefined;
                    return;
                }
                let size = 0;
                let startByte = 0;
                let endByte = 0;
                for (let i = 0; i < dataStructure.length; i++) {
                    let s = dataStructure[i];
                    s.byteSize = that.getByteSize(s.type) * s.count;
                    s.startByte = startByte;
                    endByte = startByte + s.byteSize;
                    s.endByte = endByte - 1;
                    size += s.byteSize;
                    startByte = endByte;
                }
                that[_singleDataFragmentSize] = size;
            }
        };

        initDataStructure(this[_dataStructure]);
        this[_currentStructureIndex] = 0;
        this[_currentByteIndex] = 0;
    }

    flush(byteLength) {
        if (byteLength != undefined) {
            if (byteLength != this.buffer.byteLength) {
                this.buffer = new ArrayBuffer(byteLength);
                this.dv = new DataView(this.buffer);
                this.byteDv = new Uint8Array(this.buffer);
            }
        } else {
            for (let i = 0; i < this.buffer.byteLength; i++) {
                this.byteDv[i] = 0.0;
            }
        }
        this[_currentStructureIndex] = 0;
        this[_currentByteIndex] = 0;
    }

    get dataStructure() {
        return this[_dataStructure];
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

    static get littleEndian() {
        if (littleEndian === undefined) {
            // DataView是默认按照高位存放，这里要做判断，更改存放顺序
            // PS: Float32Array却是按照低位存放的
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

    getByteSize(type) {
        switch (type) {
            case TYPE_FLOAT64 :
                return 8;
            case TYPE_UINT8CLAMPED:
            case TYPE_INT8 :
            case TYPE_UINT8 :
                return 1;
            case TYPE_INT16 :
            case TYPE_UINT16 :
                return 2;
            case TYPE_FLOAT32 :
            case TYPE_INT32 :
            case TYPE_UINT32 :
                return 4;
        }
        return 0;
    }

    get currentIndex() {
        return this[_currentByteIndex];
    }

    get bufferByteLength() {
        return this.buffer.byteLength;
    }

    get singleDataFragmentByteSize() {
        return this[_singleDataFragmentSize];
    }

    put(value) {
        if (value instanceof Array) {
            for (let i = 0; i < value.length; i++) {
                this.put(value[i]);
            }
        } else {
            if (this.dataStructure === undefined) {
                this.resizeBuffer(4);
                this.dv.setFloat32(this.currentIndex, value, DataBuffer.littleEndian);
                this[_currentByteIndex] += this.singleDataFragmentByteSize;
            } else {
                let structure = this.dataStructure[this[_currentStructureIndex]];
                let size = this.getByteSize(structure.type);
                this.resizeBuffer(size);
                this.setValue(structure.type, value);
                let k = this.currentIndex % this.singleDataFragmentByteSize;
                if (k == 0) {
                    this[_currentStructureIndex] = 0;
                    return;
                }
                if (k > structure.endByte) {
                    this[_currentStructureIndex]++;
                }
            }
        }
    }

    get(offset, type) {
        let littleEndian = DataBuffer.littleEndian;
        switch (type) {
            case TYPE_FLOAT64 :
                return this.dv.getFloat64(offset, littleEndian);
                break;
            case TYPE_UINT8CLAMPED:
                return this.dv.getUint8(offset);
                break;
            case TYPE_INT8 :
                return this.dv.getInt8(offset);
                break;
            case TYPE_UINT8 :
                return this.dv.getUint8(offset);
                break;
            case TYPE_INT16 :
                return this.dv.getInt16(offset, littleEndian);
                break;
            case TYPE_UINT16 :
                return this.dv.getUint16(offset, littleEndian);
                break;
            case TYPE_FLOAT32 :
                return this.dv.getFloat32(offset, littleEndian);
                break;
            case TYPE_INT32 :
                return this.dv.getInt32(offset, littleEndian);
                break;
            case TYPE_UINT32 :
                return this.dv.getUint32(offset, littleEndian);
                break;
        }
    }

    setValue(type, value) {
        let littleEndian = DataBuffer.littleEndian;
        let index = this.currentIndex;
        switch (type) {
            case TYPE_FLOAT64 :
                this.dv.setFloat64(index, value, littleEndian);
                this[_currentByteIndex] += 8;
                break;
            case TYPE_UINT8CLAMPED:
                this.dv.setUint8(index, value);
                this[_currentByteIndex] += 1;
                break;
            case TYPE_INT8 :
                this.dv.setInt8(index, value);
                this[_currentByteIndex] += 1;
                break;
            case TYPE_UINT8 :
                this.dv.setUint8(index, value);
                this[_currentByteIndex] += 1;
                break;
            case TYPE_INT16 :
                this.dv.setInt16(index, value, littleEndian);
                this[_currentByteIndex] += 2;
                break;
            case TYPE_UINT16 :
                this.dv.setUint16(index, value, littleEndian);
                this[_currentByteIndex] += 2;
                break;
            case TYPE_FLOAT32 :
                this.dv.setFloat32(index, value, littleEndian);
                this[_currentByteIndex] += 4;
                break;
            case TYPE_INT32 :
                this.dv.setInt32(index, value, littleEndian);
                this[_currentByteIndex] += 4;
                break;
            case TYPE_UINT32 :
                this.dv.setUint32(index, value, littleEndian);
                this[_currentByteIndex] += 4;
                break;
        }
    }

    addLength(additionLength) {
        // ArrayBuffer是不能直接进行读取的，所以利用uint8一个一个字节复制过去,这里用了TypedArray的set方法
        let sourceView = this.byteDv;
        let destView = new Uint8Array(new ArrayBuffer(this.buffer.byteLength + additionLength));
        destView.set(sourceView);
        this.buffer = destView.buffer;
        this.dv = new DataView(this.buffer);
        this.byteDv = new Uint8Array(this.buffer);
    }


    resizeBuffer(additionLength) {
        if (additionLength === undefined) additionLength = this.singleDataFragmentByteSize;
        if (this[_currentByteIndex] + additionLength > this.buffer.byteLength) {
            this.addLength(additionLength);
        }
    }

    get vertexCount() {
        return this.currentIndex / this.singleDataFragmentByteSize;
    }

    get length() {
        return this.buffer.byteLength;
    }

    clean() {
        // 重新new一个出来
        this.buffer = new ArrayBuffer(this.buffer.byteLength);
        this.dv = new DataView(this.buffer);
        this.byteDv = new Uint8Array(this.buffer);
        this[_currentByteIndex] = 0;
        this[_currentStructureIndex] = 0;
    }

    getVertex(index) {
        if (index > this.currentIndex || index < 0) throw new Error('Index Error');
        return [this.dv.getFloat32(index), this.dv.getFloat32(index + 4), this.dv.getFloat32(index + 8)]
    }

    modifyVertex(vertex, index) {
        let littleEndian = DataBuffer.littleEndian;
        if (index > this.currentIndex || index < 0) throw new Error('Index Error');
        this.dv.setFloat32(index, vertex[0], littleEndian);
        this.dv.setFloat32(index + 4, vertex[1], littleEndian);
        this.dv.setFloat32(index + 8, vertex[2], littleEndian);
    }

    putVertexData(vertex, color, opacity, texcoord) {
        this.resizeBuffer(this.singleDataFragmentByteSize);
        let littleEndian = DataBuffer.littleEndian;
        let index = this.currentIndex;
        this.dv.setFloat32(index, vertex[0], littleEndian);
        this.dv.setFloat32(index + 4, vertex[1], littleEndian);
        this.dv.setFloat32(index + 8, vertex[2], littleEndian);
        // this.dv.setFloat32(index + 12, trasnformMatrixIndex, littleEndian);
        // 这里插入1位float类型的无用数据，为了数据对齐
        this.dv.setFloat32(index + 16, 0, littleEndian);
        // 再继续添加顶点数据
        this.dv.setUint8(index + 20, color[0]);
        this.dv.setUint8(index + 21, color[1]);
        this.dv.setUint8(index + 22, color[2]);
        this.dv.setUint8(index + 23, Math.floor(opacity * 100));
        this.dv.setFloat32(index + 24, texcoord[0], littleEndian);
        this.dv.setFloat32(index + 28, texcoord[1], littleEndian);

        this[_currentByteIndex] += this.singleDataFragmentByteSize;
    }

}