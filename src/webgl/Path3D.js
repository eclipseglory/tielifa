export default class Path3D {
    constructor() {
        this.subPathArray = [];
    }

    addSubPath(subPath) {
        this.subPathArray.push(subPath);
    }

    clean() {
        this.subPathArray = [];
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