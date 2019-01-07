import Mat4 from "../math/Mat4.js";
import Tools from "../utils/Tools.js";

let _transformMatrix = Symbol('变换矩阵');
export default class ContextState {
    constructor(canvasDrawingStyle) {
        this.canvasDrawingStyle = canvasDrawingStyle;
        this.matrixIndex = 0;
        this.fillStyle = '#000000';
        this.strokeStyle = '#000000';
        this.globalAlpha = 1;
        this.id = -1;
        this.matrixArray = [];
        this.matrixArray.push(Mat4.identity());
        this.dirty = false;
    }

    fireDirty() {
        this.dirty = true;
    }

    get transformMatrixId() {
        return this.matrixArray.length - 1;
    }

    get transformMatrix() {
        let index = this.matrixArray.length - 1;
        let m = this.matrixArray[index];
        return {matrix: m, id: index};
    }

    setTransformMatrix(value) {
        let current = this.transformMatrix.matrix;
        Mat4.copy(value, current);
    }

    checkDirty() {
        // 如果当前的矩阵会被应用到某些节点上，则说明这个矩阵脏了，
        // 一旦变换矩阵就要保存一下，并把这个矩阵的克隆放入数组底
        if (this.dirty) {
            let m1 = Mat4.identity();
            let lastMatrix = this.transformMatrix.matrix;
            Mat4.copy(lastMatrix, m1);
            this.matrixArray.push(m1);
            this.dirty = false;
        }
    }

    applyTransform(currentTransformMatrix) {
        this.checkDirty();
        let lastMatrix = this.transformMatrix.matrix;
        Mat4.multiply(lastMatrix, lastMatrix, currentTransformMatrix);
    }

    translate(x, y, z) {
        if (z === undefined) z = 0;
        if (Tools.equals(x, 0) && Tools.equals(y, 0) && Tools.equals(z, 0)) {
            return;
        }
        let m = Mat4.TEMP_MAT4[0];
        Mat4.translationMatrix(m, x, y, z);
        this.applyTransform(m);
    }

    // 默然是按照z轴旋转
    rotateZ(radian) {
        if (Tools.equals(radian, 0)) {
            return;
        }
        let m = Mat4.TEMP_MAT4[0];
        Mat4.rotationZMatrix(m, radian);
        this.applyTransform(m);
    }

    rotateX(radian) {
        if (Tools.equals(radian, 0)) {
            return;
        }
        let m = Mat4.TEMP_MAT4[0];
        Mat4.rotationXMatrix(m, radian);
        this.applyTransform(m);
    }

    rotateY(radian) {
        if (Tools.equals(radian, 0)) {
            return;
        }
        let m = Mat4.TEMP_MAT4[0];
        Mat4.rotationYMatrix(m, radian);
        this.applyTransform(m);
    }

    scale(scaleX, scaleY, scaleZ) {
        if (scaleZ === undefined) scaleZ = 1;
        if (Tools.equals(scaleX, 1) && Tools.equals(scaleY, 1) && Tools.equals(scaleZ, 1)) {
            return;
        }
        let m = Mat4.TEMP_MAT4[0];
        Mat4.scalingMatrix(m, scaleX, scaleY, scaleZ);
        this.applyTransform(m);
    }

    clone() {
        let newState = new ContextState(this.canvasDrawingStyle.clone());
        newState.fillStyle = this.fillStyle;
        newState.strokeStyle = this.strokeStyle;
        newState.globalAlpha = this.globalAlpha;
        newState.matrixIndex = this.matrixIndex;
        // 把当前的矩阵作为新矩阵的最后一个
        newState.setTransformMatrix(this.transformMatrix.matrix);
        return newState;
    }
}