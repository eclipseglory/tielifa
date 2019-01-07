let _point = Symbol('存放坐标值的Float32数组');
let _transformMatrixIndex = Symbol('坐标转换矩阵索引');
export default class Point3D {
    constructor(x, y, z) {
        this[_point] = new Float32Array(3);
        this[_transformMatrixIndex] = new Uint16Array(2);
        this[_point][0] = x;
        this[_point][1] = y;
        this[_point][2] = z;
    }

    get matrixIdData(){
        return this[_transformMatrixIndex];
    }

    get contextStateIndex(){
        return this[_transformMatrixIndex][0];
    }

    set contextStateIndex(index){
        this[_transformMatrixIndex][0] = index;
    }

    get transformMatrixIndex(){
        return this[_transformMatrixIndex][1];
    }

    set transformMatrixIndex(index){
        this[_transformMatrixIndex][1] = index;
    }

    get value(){
        return this[_point];
    }

    set value(value){
        this[_point][0] = value[0];
        this[_point][1] = value[1];
        this[_point][2] = value[2];
    }

    get x() {
        return this[_point][0];
    }

    get y() {
        return this[_point][1];
    }

    get z() {
        return this[_point][2];
    }

    set x(x) {
        this[_point][0] = x;
    }

    set y(y) {
        this[_point][1] = y;
    }

    set z(z) {
        this[_point][2] = z;
    }
}