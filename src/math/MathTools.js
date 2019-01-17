'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MathTools = function () {
    function MathTools() {
        _classCallCheck(this, MathTools);
    }

    _createClass(MathTools, null, [{
        key: 'calculateLineFunctionConstant',
        value: function calculateLineFunctionConstant(point1, point2) {
            var deltaX = point1.x - point2.x;
            var deltaY = point1.y - point2.y;

            var x1 = point1.x;
            var y1 = point1.y;
            var x2 = point2.x;
            var y2 = point2.y;

            // if (deltaY < 0) {
            //     let x = x1;
            //     x1 = x2;
            //     x2 = x;
            //     let y = y1;
            //     y1 = y2;
            //     y2 = y;
            // }
            // 根据直线方程 kx+b=y 计算 k和b的值
            var b = 0;
            var k = 0;
            if (deltaX == 0) {
                return { k: undefined, b: -x1 };
            }
            if (deltaY == 0) {
                return { k: 0, b: y1 };
            }
            if (deltaX != 0 && deltaY != 0) {
                b = (y2 * x1 - y1 * x2) / (x1 - x2);
                if (x2 != 0) {
                    k = (y2 - b) / x2;
                } else {
                    k = (y1 - b) / x1;
                }
            }
            return { 'b': b, 'k': k };
        }
    }]);

    return MathTools;
}();

exports.default = MathTools;