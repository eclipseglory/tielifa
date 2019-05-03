let _p = Symbol('坐标值');
export default class Point2D {

    get x() {
        return this[_p][0];
    }

    set x(value) {
        this[_p][0] = value;
    }

    get y() {
        return this[_p][1];
    }

    set y(value) {
        this[_p][1] = value;
    }

    constructor(x, y) {
        this[_p] = new Float32Array(2);
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Point2D(this.x, this.y);
    }
}