export default class Path3D {
    constructor() {
        this.subPathArray = [];
    }

    addSubPath(subPath) {
        this.subPathArray.push(subPath);
    }

    clean() {
        this.subPathArray.length = 0;
    }

    get subPathNumber() {
        return this.subPathArray.length;
    }

    get lastSubPath() {
        if (this.subPathNumber != 0) {
            return this.subPathArray[this.subPathNumber - 1];
        }
    }
}