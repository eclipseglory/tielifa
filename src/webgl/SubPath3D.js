'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _currentIndex = Symbol('当前的点所在的索引位置');
var _pointsCoordinateArray = Symbol('点的坐标值数组,每三个为一组，分别是x,y,z');
var _pointsTransformMatrixArray = Symbol('点的坐标值数组，每两个为一组，分别是stateId,matrixId');

var SubPath3D = function () {
    function SubPath3D() {
        _classCallCheck(this, SubPath3D);

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

    _createClass(SubPath3D, [{
        key: 'init',
        value: function init() {
            this.isClosed = false;
            this[_currentIndex] = 0;
        }
    }, {
        key: 'getPointX',
        value: function getPointX(index) {
            index = index * 3;
            return this[_pointsCoordinateArray][index];
        }
    }, {
        key: 'getPointY',
        value: function getPointY(index) {
            index = index * 3;
            return this[_pointsCoordinateArray][index + 1];
        }
    }, {
        key: 'getPointZ',
        value: function getPointZ(index) {
            index = index * 3;
            return this[_pointsCoordinateArray][index + 2];
        }
    }, {
        key: 'getPointStateId',
        value: function getPointStateId(index) {
            index = index * 2;
            return this[_pointsTransformMatrixArray][index];
        }
    }, {
        key: 'getPointMatrixId',
        value: function getPointMatrixId(index) {
            index = index * 2;
            return this[_pointsTransformMatrixArray][index + 1];
        }
    }, {
        key: 'getPointMatrixData',
        value: function getPointMatrixData(index) {
            return [this.getPointStateId(index), this.getPointMatrixId(index)];
        }
    }, {
        key: 'setPoint',
        value: function setPoint(index, x, y, z, stateId, matrixId) {
            stateId = stateId || 0;
            matrixId = matrixId || 0;
            var sIndex = index * 2;
            index = index * 3;
            this[_pointsCoordinateArray][index] = x;
            this[_pointsCoordinateArray][index + 1] = y;
            this[_pointsCoordinateArray][index + 2] = z;
            this[_pointsTransformMatrixArray][sIndex] = stateId;
            this[_pointsTransformMatrixArray][sIndex + 1] = matrixId;
        }
    }, {
        key: 'addPoint',
        value: function addPoint(x, y, z, stateId, matrixId) {
            stateId = stateId || 0;
            matrixId = matrixId || 0;
            var index = this[_currentIndex];
            if (index * 3 >= this[_pointsCoordinateArray].length) {
                this[_pointsCoordinateArray].push(x);
                this[_pointsCoordinateArray].push(y);
                this[_pointsCoordinateArray].push(z);
            } else {
                this[_pointsCoordinateArray][index] = x;
                this[_pointsCoordinateArray][index + 1] = y;
                this[_pointsCoordinateArray][index + 2] = z;
            }
            if (index * 2 >= this[_pointsTransformMatrixArray].length) {
                this[_pointsTransformMatrixArray].push(stateId);
                this[_pointsTransformMatrixArray].push(matrixId);
            } else {
                this[_pointsTransformMatrixArray][index] = stateId;
                this[_pointsTransformMatrixArray][index + 1] = matrixId;
            }
            this[_currentIndex]++;
        }
    }, {
        key: 'close',
        value: function close() {
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


    }, {
        key: 'clean',
        value: function clean() {
            this[_pointsCoordinateArray] = [];
            this[_pointsTransformMatrixArray] = [];
            this.isClosed = false;
        }

        /**
         * @deprecated
         * @param point
         */
        // pushPoint(point) {
        //     this.pointsArray.push(point);
        // }

    }, {
        key: 'pointsCoordinateArray',
        get: function get() {
            return this[_pointsCoordinateArray];
        }
    }, {
        key: 'pointsNumber',
        get: function get() {
            return this[_currentIndex];
            // return this.pointsArray.length;
        }
    }]);

    return SubPath3D;
}();

exports.default = SubPath3D;