let _value = Symbol('float32数组，3位')

export default class Dimension3 {
    constructor(x, y, z) {
        this[_value] = new Float32Array(3);
        if (x != undefined)
            this[_value][0] = x;
        if (y != undefined)
            this[_value][1] = y;
        if (z != undefined)
            this[_value][2] = z;
    }

    get x() {
        return this[_value][0];
    }

    set x(value) {
        this[_value][0] = value;
    }

    get y() {
        return this[_value][1];
    }

    set y(value) {
        this[_value][1] = value;
    }

    get z() {
        return this[_value][2];
    }

    set z(value) {
        this[_value][2] = value;
    }
}