import CoordinateSystemFigure from "../CoordinateSystemFigure.js";
import Cube from "../../figure/Cube.js";
import Text from "../../figure/Text.js";
import BarFigure from "./BarFigure.js";
import FigureAnimation from "../../figure/FigureAnimation.js";

export default class Bar3DChart extends CoordinateSystemFigure {
    get widthRate() {
        return this._widthRate;
    }

    set widthRate(value) {
        if (value == this._widthRate) return;
        this._widthRate = value;
        this.fireDirty();
    }

    get depthRate() {
        return this._depthRate;
    }

    set depthRate(value) {
        if (value == this._depthRate) return;
        this._depthRate = value;
        this.fireDirty();
    }

    get paddingRate() {
        return this._paddingRate;
    }

    set paddingRate(value) {
        if (value == this._paddingRate) return;
        this._paddingRate = value;
        this.fireDirty();
    }

    get originalValue() {
        return this._originalValue;
    }

    set originalValue(value) {
        if (value == this._originalValue) return;
        this._originalValue = value;
        this.fireDirty();
    }

    get minValue() {
        return this._minValue;
    }

    set minValue(value) {
        if (value == this._minValue) return;
        this._minValue = value;
        this.fireDirty();
    }

    get maxValue() {
        return this._maxValue;
    }

    set maxValue(value) {
        if (value == this._maxValue) return;
        this._maxValue = value;
        this.fireDirty();
    }

    get negativeColumn() {
        return this._negativeColumn;
    }

    set negativeColumn(value) {
        if (value == this._negativeColumn) return;
        this._negativeColumn = value;
        this.fireDirty();
    }

    get positiveColumn() {
        return this._positiveColumn;
    }

    set positiveColumn(value) {
        if (value == this._positiveColumn) return;
        this._positiveColumn = value;
        this.fireDirty();
    }

    constructor(p) {
        p = p || {};
        super(p);
        this.originalPoint.x = -1;
        this.originalPoint.y = -1;
        this.originalPoint.z = -1;
        this._originalValue = p['originalValue'] || 0;
        this._minValue = p['minValue'];
        if (this.minValue == null) this.minValue = 1;
        this._maxValue = p['maxValue'];
        if (this.maxValue == null) this.maxValue = 0;
        this._negativeColumn = p['negativeColumn'];
        if (this.negativeColumn == null) this.negativeColumn = 1;
        this._positiveColumn = p['positiveColumn'];
        if (this.positiveColumn == null) this.positiveColumn = 1;

        this.keyColumn = p['keyColumn'];
        this.valueColumns = p['valueColumns'];
        if (this.valueColumns == null) this.valueColumns = [1];
        this.barFigureCatchSize = p['barCatchSize'];
        if (this.barFigureCatchSize == null) this.barFigureCatchSize = 10;


        this._widthRate = p['widthScale'];
        if (this._widthRate == null) this._widthRate = 0.8;
        this._depthRate = p['depthScale'];
        if (this._depthRate == null) this._depthRate = 0.8;
        this._paddingRate = p['paddingScale'];
        if (this._paddingRate == null) this._paddingRate = 0.1;
        this.catchCube = [];
        this.originalCoord = {x: 0, y: 0, z: 0};
        this.textLoader = p['textLoader'];
        this.barFigureArray = [];

        let callbacks = p['animationCallbacks'];

        this.runningAnimation = false;
        this.animationTime = p['animationTime'];
        if (this.animationTime == null) {
            this.animationTime = 500;
        }
        this.animation = new FigureAnimation(this, {time: this.animationTime, callbacks: callbacks});

        // this.colors = p['colors'];
        // this.types = p['types'];
        // this.lineWidth = p['lineWidth'] || 2;
        // this.xAxisColor = p['xAxisColor'] || 'white';
        // this.yAxisColor = p['yAxisColor'] || 'white';
    }

    get animationCallbacks() {
        return this.animation.callbacks;
    }

    set animationCallbacks(callbacks) {
        this.animation.callbacks = callbacks;
    }

    getOriginalCoord() {
        this.originalCoord.x = this.width / 2 * this.originalPoint.x;
        this.originalCoord.y = -this.height / 2 * this.originalPoint.y;
        this.originalCoord.z = this.depth / 2 * this.originalPoint.z;
        return this.originalCoord;
    }

    stopAnimation() {
        this.animation.stop();
    }

    initCoordinate() {
        let totalValue = this._maxValue - this._minValue;
        let halfValue = totalValue / 2;
        let r = this._minValue;
        let rate = (this._originalValue - this._minValue) / totalValue;
        rate = rate * 2 - 1;
        this.originalPoint.y = rate;
        this.lal.xz.latExtendLength2 = 20;
        this.lal.xz.latExtendAngle2 = -45;
        this.lal.xz.latNum = this._negativeColumn;
        this.lal.xz.lonNum = 1;
        this.lal.xz.lonBgc = 'gray';

        this.lal.xy.lonNum = 10;
        this.lal.xy.lonColor = 'gray';
        // this.lal.xy.lonBgc = 'red';
        // this.lal.xy.lonBgc2 = 'orange';

        this.lal.yz.lonNum = 10;
        this.lal.yz.lonExtendLength = 20;
        this.lal.yz.lonExtendAngle = -45;
    }

    createBarFigures(property) {
        let x = this.width / 2 * this.originalPoint.x;
        let y = -this.height / 2 * this.originalPoint.y;
        let z = this.depth / 2 * this.originalPoint.z;

        let dataProperty = property;
        let maxValue = dataProperty._maxValue;
        let columns = this._negativeColumn;
        let columnWidth = (this.width / 2 - x) / columns;
        let cubeDefaultHeight = this.height;
        let widthRate = this._widthRate;
        let barWidth = columnWidth * widthRate;
        let spaceWidth = (columnWidth - barWidth) / 2;
        let perHeight = this.height / dataProperty.totalMax;
        let barDepth = columnWidth * this._depthRate;

        let cubeX = x + spaceWidth + barWidth / 2;
        let cubeY = y - cubeDefaultHeight / 2;
        let cubeZ = z + this.depth / 2;
        for (let i = 0; i < columns; i++, cubeX += columnWidth) {
            let d = this.data[i];
            if (d == null) continue;
            let catchFigures = this.catchCube[i];

            let height = 20;
            let barTitle = null;
            if (catchFigures != null) {
                barTitle = catchFigures.title;
                barTitle.parent = null;
            }
            if (barTitle == null) {
                barTitle = new Text();
                barTitle.addEventListener(Cube.EVENT_AFTER_PREPARE_SELF, function (event) {
                    let barTitle = event.source;
                    barTitle.y = y - (barTitle.data - barTitle.parent._originalValue) * perHeight - height;
                    barTitle.text = Math.floor(barTitle.data) + "k";
                    // console.log(barTitle.backMapData);
                    // barTitle.fireDirty();
                });
            }
            barTitle.data = this.data[i][1];
            barTitle.x = cubeX;
            barTitle.z = cubeZ;
            // barTitle.y = y - (this.backMapData[i][1] - this.originalValue) * perHeight - height;
            barTitle.fontFamily = 'songti';
            barTitle.color = "green";
            barTitle.fontStyle = "italic";
            barTitle.fontSize = height;
            barTitle.text = this.data[i][1].toString() + "k";
            barTitle.textAlign = 'center';

            let cube = null;
            if (catchFigures != null) {
                cube = catchFigures.cube;
                cube.parent = null;
            }
            if (cube == null) {
                cube = new Cube();
                cube.addEventListener(Cube.EVENT_AFTER_PREPARE_SELF, function (event) {
                    let cube = event.source;
                    cube.scaleY = (cube.data - cube.parent._originalValue) * perHeight / cubeDefaultHeight;
                    if (cube.scaleY === 0) {
                        cube.scaleY = 0.000001;
                    }
                });
            }

            cube.color = 'orange';
            cube.x = cubeX;
            cube.y = cubeY;
            cube.z = cubeZ;
            cube.width = barWidth;
            cube.height = cubeDefaultHeight;
            cube.depth = this.depth;
            cube.scaleZ = this._depthRate;
            cube.data = this.data[i][1];
            cube.scaleY = 0.01;
            // cube.scaleY = (this.backMapData[i][1] - this.originalValue) * perHeight / cubeDefaultHeight;
            cube.anchorY = 1;

            let columnText = null;
            if (catchFigures != null) {
                columnText = catchFigures.columnText;
                columnText.parent = null;
            }
            if (columnText == null)
                columnText = new Text({anchorY: 0});
            columnText.rotateX = 45;
            columnText.x = cubeX;
            columnText.z = this.depth / 2;
            columnText.y = this.height / 2 + this.lal.xz.latExtendLength2 * 2 / 3;
            columnText.fontFamily = '雅黑';
            columnText.color = "black";
            columnText.fontSize = height;
            columnText.fontWeight = "bold";
            columnText.maxWidth = barWidth;
            columnText.text = this.data[i][0].toString() + "年";
            columnText.textAlign = 'center';

            this.addChild(cube);
            this.addChild(barTitle);
            this.addChild(columnText);
            if (catchFigures == null) {
                this.catchCube[i] = {cube: cube, title: barTitle, columnText: columnText};
            }
        }
    }

    getColumnWidth() {
        let original = this.getOriginalCoord();
        return (this.width / 2 - original.x) / this._negativeColumn;
    }

    getPerHeight() {
        return this.height / (this._maxValue - this._minValue);
    }

    _animationComplete(animation) {
        // let figure = animation.figure;
        // let p = figure.parent;
        // if (figure instanceof Bar3DChart) {
        //     p = figure;
        // }
        // p.runningAnimation = false;
        // if (p != null) {
        //     if (p.animationCatch.length < p.animationMaxsize) {
        //         p.animationCatch.push(animation);
        //         console.log('回收动画对象');
        //     }
        // }
    }

    getDataKey(data, index) {
        if (this.keyColumn != null) {
            return data[this.keyColumn].toString();
        }
        return index.toString();
    }

    getBarData(key, zIndex) {
        return this[key + 'Data'];
    }

    getBarIndex(key) {
        return this[key + 'Index'];
    }

    setData(data, useAnimation) {
        if (useAnimation == null) useAnimation = false;
        if (this.animation.isRunning) {
            console.warn('上次数据更好动画未结束，不能更改数据');
            return;
        }
        this.data = data;
        this.calculateDataProperty(data, useAnimation);
        // this.initCoordinate();
        let columns = this._negativeColumn;
        let childrenSize = this.children.length;
        this.children.clean();
        for (let i = 0; i < columns; i++) {
            let barData = data[i];
            if (barData == null) continue;

            let barFigure = this.barFigureArray[i];
            if (barFigure == null) {
                barFigure = new BarFigure();
                this.barFigureArray.push(barFigure);
            }
            let barColumnData = barData[1];
            let key = this.getDataKey(barData, i);
            barFigure.key = key;
            barFigure.realIndex = i;
            this.addChild(barFigure);


            let dataKey = key + 'Data';
            let indexKey = key + 'Index';
            if (this[dataKey] == null) this[dataKey] = this.originalValue;
            if (this[indexKey] == null) this[indexKey] = columns + i;
            if (useAnimation) {
                this.animation.propertyChange(barColumnData - this[dataKey], dataKey);
                this.animation.propertyChange(i - this[indexKey], indexKey);
            } else {
                this[dataKey] = barColumnData;
                this[indexKey] = i;
            }
        }
        if (useAnimation) {
            this.negativeColumn = childrenSize;
            this.animation.propertyChange(columns - this.negativeColumn, 'negativeColumn');
            this.animation.start();
        }
    }

    prepareSelf(ctx) {
        super.prepareSelf(ctx);
        this.initCoordinate();
    }

    calculateDataProperty(data, useAnimation) {
        if (useAnimation == null) useAnimation = false;
        let maxValue = this._maxValue;
        let minValue = this._minValue;
        if (maxValue == null) maxValue = this._originalValue;
        if (minValue == null) minValue = this._originalValue;
        let nc = data.length;
        if (this._positiveColumn == null) {
            this._positiveColumn = 0;
        }
        if (this._originalValue > maxValue) maxValue = this._originalValue;
        if (this._originalValue < minValue) minValue = this._originalValue;
        // let minValue = this.originalValue;
        for (let i = 0; i < data.length; i++) {
            let d = data[i][1];
            if (d === null) continue;
            if (maxValue == null) {
                maxValue = d;
            } else {
                maxValue = Math.max(d, maxValue);
            }
            if (minValue == null) {
                minValue = d;
            } else {
                minValue = Math.min(d, minValue);
            }
        }
        // let testMin = minValue;
        // let bit = 0;
        // while (testMin >= 10) {
        //     testMin = testMin / 10;
        //     bit++;
        // }
        // if (bit === 0) bit = 1;
        // let b = bit * 10;
        // let totalMax = Math.ceil((maxValue - minValue) / b) * b;
        let totalMax = maxValue - minValue;
        let b = 10;
        if (useAnimation) {
            this.animation.propertyChange(maxValue - this.maxValue, 'maxValue');
            this.animation.propertyChange(minValue - this.minValue, 'minValue');
            // this.animation.propertyChange(nc - this.negativeColumn, 'negativeColumn');
            this.animation.start();
        } else {
            this.maxValue = maxValue;
            this.minValue = minValue;

        }

        this.negativeColumn = nc;
        // return {totalMax: totalMax, minValue: minValue, maxValue: maxValue, bit: b};
    }
}