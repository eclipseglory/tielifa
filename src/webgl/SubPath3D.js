let _currentIndex = Symbol('当前的点所在的索引位置');
let _pointsCoordinateArray = Symbol('点的坐标值数组,每三个为一组，分别是x,y,z');
let _pointsTransformMatrixArray = Symbol('点的坐标值数组，每两个为一组，分别是stateId,matrixId');
export default class SubPath3D {
    constructor() {
        // this.pointsArray = [];
        this[_currentIndex] = 0;
        this[_pointsCoordinateArray] = [];
        this[_pointsTransformMatrixArray] = [];
        // if (startPoint != undefined && startPoint != null) {
        //     this.pushPoint(startPoint);
        // }
        this.isClosed = false;
        this.isRegularRect = false;
    }

    init() {
        this.isClosed = false;
        this[_currentIndex] = 0;
    }

    get pointsCoordinateArray() {
        return this[_pointsCoordinateArray];
    }


    getPointX(index) {
        index = index * 3;
        return this[_pointsCoordinateArray][index];
    }

    getPointY(index) {
        index = index * 3;
        return this[_pointsCoordinateArray][index + 1];
    }

    getPointZ(index) {
        index = index * 3;
        return this[_pointsCoordinateArray][index + 2];
    }

    getPointStateId(index) {
        index = index * 2;
        return this[_pointsTransformMatrixArray][index];
    }

    getPointMatrixId(index) {
        index = index * 2;
        return this[_pointsTransformMatrixArray][index + 1];
    }

    getPointMatrixData(index) {
        return [this.getPointStateId(index), this.getPointMatrixId(index)];
    }

    setPoint(index, x, y, z, stateId) {
        stateId = stateId || 0;
        // matrixId = matrixId || 0;
        let sIndex = index * 2;
        index = index * 3;
        this[_pointsCoordinateArray][index] = x;
        this[_pointsCoordinateArray][index + 1] = y;
        this[_pointsCoordinateArray][index + 2] = z;
        // this[_pointsTransformMatrixArray][sIndex] = stateId;
        // this[_pointsTransformMatrixArray][sIndex + 1] = matrixId;
    }

    addPoint(x, y, z, stateId) {
        stateId = stateId || 0;
        // matrixId = matrixId || 0;
        let index = this[_currentIndex];
        if (index * 3 >= this[_pointsCoordinateArray].length) {
            this[_pointsCoordinateArray].push(x);
            this[_pointsCoordinateArray].push(y);
            this[_pointsCoordinateArray].push(z);
        } else {
            this[_pointsCoordinateArray][index] = x;
            this[_pointsCoordinateArray][index + 1] = y;
            this[_pointsCoordinateArray][index + 2] = z;
        }
        // if (index * 2 >= this[_pointsTransformMatrixArray].length) {
        //     this[_pointsTransformMatrixArray].push(stateId);
        //     this[_pointsTransformMatrixArray].push(matrixId);
        // } else {
        //     this[_pointsTransformMatrixArray][index] = stateId;
        //     this[_pointsTransformMatrixArray][index + 1] = matrixId;
        // }
        this[_currentIndex]++;
    }

    close() {
        this.isClosed = true;
    }

    // /**
    //  * @deprecated
    //  * @param index
    //  * @returns {*}
    //  */
    // getPoint(index) {
    //     return this.pointsArray[index];
    // }


    clean() {
        this[_pointsCoordinateArray] = [];
        this[_pointsTransformMatrixArray] = [];
        this.isClosed = false;
    }

    get pointsNumber() {
        return this[_currentIndex];
        // return this.pointsArray.length;
    }
}