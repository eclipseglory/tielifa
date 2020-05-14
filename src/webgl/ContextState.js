import Mat4 from "../math/Mat4.js";
import Tools from "../utils/Tools.js";

const Normal_Filter = 0;
const GaussianBlur_Filter = 1;
const Unsharpen_Filter = 2;
const Sharpness_Filter = 3;
const Sharpen_Filter = 4;
const EdgeDetect_Filter = 5;
const SobelHorizontal_Filter = 6;
const SobelVertical_Filter = 7;
const PrevitHorizontal_Filter = 8;
const PrevitVertical_Filter = 9;
const BoxBlur_Filter = 10;
const TriangleBlur_Filter = 11;
const Emboss_Filter = 12;
export default class ContextState {
    constructor(canvasDrawingStyle) {
        this.canvasDrawingStyle = canvasDrawingStyle;
        this.matrixIndex = 0;
        this.fillStyle = '#000000';
        this.strokeStyle = '#000000';
        this.globalAlpha = 1;
        this.id = -1;
        this.matrix = Mat4.identity();
        this.filterType = Normal_Filter;
        this.dirty = false;
        this.scaleValue = {x: 1, y: 1, z: 1};
    }

    static get Normal_Filter() {
        return Normal_Filter;
    }

    static get GaussianBlur_Filter() {
        return GaussianBlur_Filter;
    }

    static get Unsharpen_Filter() {
        return Unsharpen_Filter;
    }

    static get Sharpness_Filter() {
        return Sharpen_Filter;
    }

    static get Sharpen_Filter() {
        return Sharpen_Filter;
    }

    static get EdgeDetect_Filter() {
        return EdgeDetect_Filter;
    }

    static get SobelHorizontal_Filter() {
        return SobelHorizontal_Filter;
    }

    static get SobelVertical_Filter() {
        return SobelVertical_Filter;
    }

    static get PrevitHorizontal_Filter() {
        return PrevitHorizontal_Filter;
    }

    static get PrevitVertical_Filter() {
        return PrevitVertical_Filter;
    }

    static get BoxBlur_Filter() {
        return BoxBlur_Filter;
    }

    static get TriangleBlur_Filter() {
        return TriangleBlur_Filter;
    }

    static get Emboss_Filter() {
        return Emboss_Filter;
    }


    get transformMatrix() {
        return this.matrix;
    }

    setTransformMatrix(value) {
        // let current = this.transformMatrix.matrix;
        Mat4.copy(value, this.matrix);
    }

    applyTransform(currentTransformMatrix) {
        let lastMatrix = this.matrix;
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
        this.scaleValue.x*=scaleX;
        this.scaleValue.y*=scaleY;
        this.scaleValue.z*=scaleZ;
        this.applyTransform(m);
    }

    get lineWidth() {
        return this.canvasDrawingStyle.lineWidth;
    }

    set lineWidth(width) {
        this.canvasDrawingStyle.lineWidth = width;
    }

    get textAlign() {
        return this.canvasDrawingStyle.textAlign;
    }

    set textAlign(textAlign) {
        this.canvasDrawingStyle.textAlign = textAlign;
    }

    get textBaseline() {
        return this.canvasDrawingStyle.textBaseline;
    }

    set textBaseline(textBaseline) {
        this.canvasDrawingStyle.textBaseline = textBaseline;
    }

    clone() {
        let newState = new ContextState(this.canvasDrawingStyle.clone());
        newState.fillStyle = this.fillStyle;
        newState.strokeStyle = this.strokeStyle;
        newState.globalAlpha = this.globalAlpha;
        newState.filterType = this.filterType;
        newState.scaleValue.x = this.scaleValue.x;
        newState.scaleValue.y = this.scaleValue.y;
        newState.scaleValue.z = this.scaleValue.z;

        // newState.matrixIndex = this.matrixIndex;
        // 把当前的矩阵作为新矩阵的最后一个
        newState.setTransformMatrix(this.transformMatrix);
        return newState;
    }
}