import CoordinateSystemFigure from "../CoordinateSystemFigure.js";
import BarFigure from "./BarFigure.js";
import FigureAnimation from "../../figure/FigureAnimation.js";


const DISPLAY_H = 'h_display_type';
const DISPLAY_V = 'v_display_type';
export default class Bar3DChart extends CoordinateSystemFigure {

    static get DISPLAY_H() {
        return DISPLAY_H;
    }

    static get DISPLAY_V() {
        return DISPLAY_V;
    }

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
        this.realTimeDraw = true;
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

        this.displayType = DISPLAY_H;


        this._barDepthRate = p['barDepthRate'];
        if (this._barDepthRate == null) this._barDepthRate = 1;

        this._widthRate = p['widthScale'];
        if (this._widthRate == null) this._widthRate = 0.8;
        this._depthRate = p['depthScale'];
        if (this._depthRate == null) this._depthRate = 1;
        this._paddingRate = p['paddingScale'];
        if (this._paddingRate == null) this._paddingRate = 0.1;
        this.catchCube = [];
        this.originalCoord = {x: 0, y: 0, z: 0};
        this.textLoader = p['textLoader'];
        this.barPropertyLoader = p['barPropertyLoader'];
        this.columnTextLoader = p['columnTextLoader'];

        let that = this;

        if (this.textLoader == null) {
            this.textLoader = function (data, key) {
                return data.toString();
            }
        }
        if (this.columnTextLoader == null) {
            this.columnTextLoader = function (defaultText, key) {
                return defaultText;
            }
        }

        this.barFigureArray = {};
        this._animationCallbacks = p['animationCallbacks'];

        this.runningAnimation = false;
        this.animationTime = p['animationTime'];
        if (this.animationTime == null) {
            this.animationTime = 500;
        }
        this.animation = new FigureAnimation(this, {
            time: this.animationTime, callbacks: {
                complete: function (animation) {
                    let callbacks = that._animationCallbacks;
                    if (callbacks && callbacks.complete) {
                        callbacks.complete(animation);
                    }
                    that._removeUselessBarFigureAndDatas();
                }, interrupt: function (animation) {
                    let callbacks = that._animationCallbacks;
                    if (callbacks && callbacks.interrupt) {
                        callbacks.interrupt(animation);
                    }
                    that._removeUselessBarFigureAndDatas();
                }
            }
        });
        this.currentData = {};

        this._firstDisplay = true;

        this.displayChildrenSize = 0;
        this.displayChildrenKeys = [];
        // this.colors = p['colors'];
        // this.types = p['types'];
        // this.lineWidth = p['lineWidth'] || 2;
        // this.xAxisColor = p['xAxisColor'] || 'white';
        // this.yAxisColor = p['yAxisColor'] || 'white';
    }

    _removeUselessBarFigureAndDatas() {
        let remove = [];
        for (let i = 0; i < this.children.size; i++) {
            let child = this.getChild(i);
            let key = child.key;
            if (this.displayChildrenKeys.indexOf(key) == -1) {
                let dataKey = key + '@Data';
                let indexKey = key + '@Index';
                let columnKey = key + '@Column';
                delete this[columnKey];
                delete this[indexKey];
                delete this[dataKey];
                let child = this.barFigureArray[key];
                remove.push(child);
                delete this.barFigureArray[key];
            }
        }
        for (let i = 0; i < remove.length; i++)
            this.removeChild(remove[i]);
    }

    getDefaultColumnText(key) {
        return this[key + "@Column"];
    }

    get animationCallbacks() {
        this._animationCallbacks;
    }

    set animationCallbacks(callbacks) {
        this._animationCallbacks = callbacks;
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
        if (this.displayType == DISPLAY_V) {
            this.lal.xz.lonNum = this.valueColumns.length;
        }
        let columnWidth = this.getColumnWidth();
        //这里设置坐标系的深度大小:
        if (this.displayType == DISPLAY_V) {
            this.depth = Math.floor(columnWidth * this._barDepthRate * this.valueColumns.length);
        } else if (this.displayType == DISPLAY_H) {
            this.depth = Math.floor(columnWidth * this._barDepthRate / this.valueColumns.length);
        }


        this.lal.xz.lonBgc = 'gray';

        this.lal.xy.lonNum = 10;
        this.lal.xy.lonColor = 'gray';
        // this.lal.xy.lonBgc = 'red';
        // this.lal.xy.lonBgc2 = 'orange';

        this.lal.yz.lonNum = 10;
        this.lal.yz.lonExtendLength = 20;
        this.lal.yz.lonExtendAngle = -45;
    }

    getXZLATExtendLength() {
        return this.lal.xz.latExtendLength2;
    }

    getColumnWidth() {
        let original = this.getOriginalCoord();
        return (this.width / 2 - original.x) / this._negativeColumn;
    }

    getPerHeight() {
        return this.height / (this._maxValue - this._minValue);
    }

    getDataKey(data, index, zIndex) {
        if (zIndex == null) zIndex = 1;
        if (this.keyColumn != null) {
            return data[this.keyColumn].toString();
        }
        return index.toString();
    }

    getBarColumnIndex(index, columnKey) {
        return index;
    }

    getBarData(key, columnKey) {
        // return this.currentData[key]['data'];
        return this[key + '#' + columnKey + '@Data'];
    }

    getBarIndex(key) {
        // return this.currentData[key]['index'];
        return this[key + '@Index'];
    }

    getColumnKey(valueIndex) {
        return valueIndex.toString();
    }


    setData(data, useAnimation) {
        if (useAnimation == null) useAnimation = false;
        if (this.animation.isRunning) {
            console.warn('上次数据更好动画未结束，不能更改数据');
            return;
        }
        let childrenSize = this.children.length;
        if (this._firstDisplay) {
            this.calculateDataProperty(data, false);
        } else {
            this.calculateDataProperty(data, useAnimation);
        }
        this.data = data;
        this.displayChildrenKeys = [];
        let columns = this._negativeColumn;
        this.displayChildrenSize = columns;
        let remainChildren = childrenSize - columns;
        for (let i = 0; i < columns; i++) {
            let barData = data[i];
            if (barData == null) continue;


            let key = this.getDataKey(barData, i);
            this.displayChildrenKeys.push(key);
            let barFigure = this.barFigureArray[key];
            if (barFigure == null) {
                barFigure = new BarFigure();
                this.barFigureArray[key] = barFigure;
                this.addChild(barFigure);
            }
            barFigure.opacity = 1;
            barFigure.key = key;
            barFigure.realIndex = i;
            barFigure.barKeys = [];
            for (let m = 0; m < this.valueColumns.length; m++) {
                let columnK = this.getColumnKey(this.valueColumns[m]);
                if (columnK != null)
                    barFigure.barKeys.push(columnK);
            }

            for (let j = 0; j < this.valueColumns.length; j++) {
                let valueIndex = this.valueColumns[j];
                let columnKey = valueIndex.toString();
                let dataKey = key + '#' + columnKey + '@Data';
                let barColumnData = barData[valueIndex];
                if (barColumnData == null) {
                    if (this[dataKey] != null) {
                        delete this[dataKey];
                    }
                    continue;
                }

                let indexKey = key + '@Index';
                this[key + '@Column'] = barData[0]; //测试
                if (this[dataKey] == null) this[dataKey] = this.originalValue;
                if (this[indexKey] == null) this[indexKey] = columns;
                if (useAnimation) {
                    this.animation.propertyChange(barColumnData - this.getBarData(key, columnKey), dataKey);
                } else {
                    this[dataKey] = barColumnData;

                }
                if (useAnimation && !this._firstDisplay) {
                    this.animation.propertyChange(i - this.getBarIndex(key), indexKey);
                } else {
                    this[indexKey] = i;
                }
            }
        }
        if (useAnimation && !this._firstDisplay) {
            this.negativeColumn = childrenSize;
            this.animation.propertyChange(columns - this.negativeColumn, 'negativeColumn');
        }

        if (remainChildren > 0) {
            if (useAnimation) {
                //这说明更改的时候有一些barFigure不会显示了，这需要移除对应数据以及做一些动画效果
                for (let i = 0; i < this.children.size; i++) {
                    let child = this.getChild(i);
                    let key = child.key;
                    if (this.displayChildrenKeys.indexOf(key) == -1) {
                        let indexKey = key + '@Index';
                        if (useAnimation && !this._firstDisplay) {
                            this.animation.propertyChange(childrenSize * 2 - this.getBarIndex(key), indexKey);
                        } else {
                            this[indexKey] = childrenSize * 2;
                        }
                    }
                }
            } else {
                this._removeUselessBarFigureAndDatas();
            }

        }

        if (useAnimation) {
            this.animation.start();
        }
        if (this._firstDisplay) this._firstDisplay = false;
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
            for (let j = 0; j < this.valueColumns.length; j++) {
                let valueIndex = this.valueColumns[j];
                let d = data[i][valueIndex];
                if (d == null) continue;
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