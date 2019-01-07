import DataBuffer from "./DataBuffer.js";


// 这里每个节点大小如下：
// 1. 三位是坐标，float类型，共3*4 , 12字节
// 2. 两位是贴图坐标，float类型，共2*4 , 8个字节
// 3. 四位颜色坐标, unsigleint类型，共4个字节
// 4. 有两位float类型，是空的，只是为了让整个数据块成为16的倍数,这不是强迫症，而是叫做数据对齐
const VERTEX_DATA_STRUCTURE = [
    {type: DataBuffer.TYPE_FLOAT32, count: 3},
    {type: DataBuffer.TYPE_FLOAT32, count: 2},
    {type: DataBuffer.TYPE_UINT8, count: 4},
    {type: DataBuffer.TYPE_FLOAT32, count: 2}
];
const VERTEX_BYTE_LENGTH = 32;

const MATRIX_INDEX_STRUCTURE = [
    {type: DataBuffer.TYPE_FLOAT32, count: 1}
];
const MATRIX_INDEX_BYTE_LENGTH = 4;

const MATRIX_ID_STRUCTURE = [
    {type: DataBuffer.TYPE_UINT16, count: 2}
];
const MATRIX_ID_BYTE_LENGTH = 4;

const TYPE_FILL = 0;
const TYPE_STROKE = 1;

export default class VertexData {

    constructor(type, vertexNum) {
        this.type = type;
        this.dataBuffer = new DataBuffer(VERTEX_DATA_STRUCTURE, vertexNum * VERTEX_BYTE_LENGTH);
        // 因为attribute不允许int类型，只有用float代替了
        this.matrixIndexBuffer = new DataBuffer(MATRIX_INDEX_STRUCTURE, vertexNum * MATRIX_INDEX_BYTE_LENGTH);
        // this.matrixIdBuffer = new DataBuffer(MATRIX_ID_STRUCTURE, vertexNum * MATRIX_ID_BYTE_LENGTH);
        this.matrixIdArray = [];
    }

    resize(vertexNum) {
        this.dataBuffer.addLength(vertexNum * VERTEX_BYTE_LENGTH);
        this.matrixIndexBuffer.addLength(vertexNum * MATRIX_INDEX_BYTE_LENGTH);
        // this.matrixIdBuffer.addLength(vertexNum * MATRIX_ID_BYTE_LENGTH);
    }

    addVertexData(points, color, opacity, textureCoor) {
        this.dataBuffer.putVertexData(points, color, opacity, textureCoor);
        // this.matrixIndexBuffer.put(transformMatrixId);
    }

    addMatrixIdData(data) {
        this.matrixIdArray.push(data);
    }

    getMatrixIdData(vertexIndex) {
        return this.matrixIdArray[vertexIndex];
    }

    getContextStateIndex(vertexIndex) {
        return this.matrixIdArray[vertexIndex][0];
    }

    getMatrixIndex(vertexIndex) {
        return this.matrixIdArray[vertexIndex][1];
    }

    putMatrixId(id) {
        this.matrixIndexBuffer.put(id);
    }

    get vertexNumber() {
        return this.bufferSize / VERTEX_BYTE_LENGTH;
    }

    static get VERTEX_BYTE_SIZE() {
        return VERTEX_BYTE_LENGTH;
    }

    get bufferSize() {
        return this.dataBuffer.currentIndex;
    }

    static get TYPE_FILL() {
        return TYPE_FILL;
    }

    static get TYPE_STROKE() {
        return TYPE_STROKE;
    }
}