
export default class MathTools {
    constructor() {

    }


    static calculateLineFunctionConstant(point1, point2) {
        let deltaX = point1.x - point2.x;
        let deltaY = point1.y - point2.y;

        let x1 = point1.x;
        let y1 = point1.y;
        let x2 = point2.x;
        let y2 = point2.y;

        // if (deltaY < 0) {
        //     let x = x1;
        //     x1 = x2;
        //     x2 = x;
        //     let y = y1;
        //     y1 = y2;
        //     y2 = y;
        // }
        // 根据直线方程 kx+b=y 计算 k和b的值
        let b = 0;
        let k = 0;
        if (deltaX == 0) {
            return {k: undefined, b: -x1};
        }
        if (deltaY == 0) {
            return {k: 0, b: y1};
        }
        if (deltaX != 0 && deltaY != 0) {
            b = (y2 * x1 - y1 * x2) / (x1 - x2);
            if (x2 != 0) {
                k = (y2 - b) / x2;
            } else {
                k = (y1 - b) / x1;
            }

        }
        return {'b': b, 'k': k};
    }
}