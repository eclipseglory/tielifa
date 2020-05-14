import Text from "../../figure/Text.js";
import Cube from "../../figure/Cube.js";
import Figure3D from "../../figure/Figure3D.js";
import Bar3DChart from "./Bar3DChart.js";

const DEFAULT_CUBE_COLORS = ['#ffffff', '#ffff00', '#'];
const DEFAULT_TEXT_FAMILY = 'arial';
const DEFAULT_TEXT_COLOR = '#000000';
export default class BarFigure extends Figure3D {
    constructor(p) {
        p = p || {};
        super(p);
        this.barKeys = [];
        this.cubes = {};
        this.cubeTextes = {};

        this.columnText = new Text({anchorY: 0});
        this.columnText.fontSize = 16;
        this.columnText.textAlign = 'center';
        this.columnText.color = '#000000';
        this.addChild(this.columnText);
        this.key = null;
    }

    // setData(data, index, zIndex) {
    //     this.data = data;
    //     this.index = index;
    //     this.zIndex = zIndex;
    // }

    get width() {
        return super.width;
    }

    set width(width) {
        super.width = width;
        this.columnText.maxWidth = width;
    }

    setFontSize(size) {
        this.text.fontSize = size;
    }

    setFontFamily(family) {
        this.text.fontFamily = family;
    }

    setFontStyle(style) {
        this.text.fontStyle = style;
    }

    setFontWeight(weight) {
        this.text.fontWeight = weight;
    }

    getText(data, key, columnKey) {
        if (this.parent != null && this.parent.textLoader != null) {
            return this.parent.textLoader(data, key, columnKey);
        }
        return data.toString();
    }

    getColumnText(key) {
        let d = key;
        if (this.parent != null) {
            d = this.parent.getDefaultColumnText(key);
        }
        if (this.parent.columnTextLoader != null) {
            return this.parent.columnTextLoader(d, key);
        }
        return d;
    }

    drawSelf(ctx) {
        //此为一个哑元，不需要绘制自己
    }

    refreshDirty(ctx) {
        //此为一个哑元，不需要绘制自己
    }

    _initCubeAndText(cube, text, columnIndex) {
        let cc = DEFAULT_CUBE_COLORS[columnIndex];
        if (cc == null) cc = '#ffffff'
        cube.color = cc;
        text.color = DEFAULT_TEXT_COLOR;
        text.fontFamily = DEFAULT_TEXT_FAMILY;
    }

    initBarProperty(cube, text, data, key, index, columnKey, columnIndex) {
        let propertyLoader = this.parent.barPropertyLoader;
        if (propertyLoader != null) {
            let property = propertyLoader(data, key, index, columnKey, columnIndex);
            if (property != null) {
                if (property.barColor != null) {
                    cube.color = property.barColor;
                } else {
                    let cc = DEFAULT_CUBE_COLORS[columnIndex];
                    if (cc == null) cc = '#ffffff'
                    cube.color = cc;
                }
                if (property.textColor != null) {
                    text.color = property.textColor;
                } else {
                    text.color = DEFAULT_TEXT_COLOR;
                }
                // if (property.textFontSize != null) {
                //     text.fontSize = property.textFontSize;
                // }
                if (property.textFontWeight != null) {
                    text.fontWeight = property.textFontWeight;
                }
                if (property.textFontStyle != null) {
                    text.fontStyle = property.textFontStyle;
                }
                if (property.textFontFamily != null) {
                    text.fontFamily = property.textFontFamily;
                } else {
                    text.fontFamily = DEFAULT_TEXT_FAMILY;
                }
            } else {
                this._initCubeAndText(cube, text, columnIndex);
            }
        } else {
            this._initCubeAndText(cube, text, columnIndex);
        }
    }

    initBarCubes() {
        for (let i = 0; i < this.barKeys.length; i++) {
            let barKey = this.barKeys[i];
            let cube = this.cubes[barKey];
            if (cube == null) {
                cube = new Cube();
                cube.realTimeDraw = true;
                this.cubes[barKey] = cube;
                this.addChild(cube);
            }
            let text = this.cubeTextes[barKey];
            if (text == null) {
                text = new Text();
                // text.realTimeDraw = true;
                this.cubeTextes[barKey] = text;
                this.addChild(text);
            }
        }
        for (let k in this.cubes) {
            if (this.barKeys.indexOf(k) == -1) {
                this.removeChild(this.cubes[k]);
                this.removeChild(this.cubeTextes[k]);
                delete this.cubes[k];
                delete this.cubeTextes[k];
            }
        }
    }

    prepareSelf(ctx) {
        super.prepareSelf(ctx);

        let index = this.parent.getBarIndex(this.key);
        let maxIndex = this.parent.displayChildrenSize;
        let opacity = maxIndex - index;
        if (opacity >= 1) opacity = 1;
        if (opacity < 0) {
            opacity *= -1;
            if (opacity >= 1) opacity = 0;
        }
        // this.opacity = opacity;
        this.initBarCubes();

        let originalCoord = this.parent.getOriginalCoord();
        let x = originalCoord.x;
        let y = originalCoord.y;
        let z = originalCoord.z;

        let parent = this.parent;
        if (parent == null) return;
        let columnWidth = parent.getColumnWidth();
        let barWidth = columnWidth * parent.widthRate;
        let spaceWidth = (columnWidth - barWidth) / 2;
        let preHeight = parent.getPerHeight();

        this.width = barWidth;
        this.height = parent.height;
        this.depth = parent.depth;
        this.z = z + parent.depth / 2;
        this.x = x + barWidth / 2 + spaceWidth + index * columnWidth;
        this.y = y;

        let displayType = parent.displayType;

        let barSpaceRate = 0.1;
        let barSpaceWidth = barSpaceRate * barWidth;
        let perWidth = (this.width - (this.barKeys.length - 1) * barSpaceWidth) / this.barKeys.length;
        let preDepth = this.depth / this.barKeys.length;
        for (let i = 0; i < this.barKeys.length; i++) {
            let columnKey = this.barKeys[i];
            let columnIndex = this.parent.getBarColumnIndex(i, columnKey);
            let data = this.parent.getBarData(this.key, columnKey);
            let cube = this.cubes[columnKey];
            let text = this.cubeTextes[columnKey];

            if (data == null) {
                cube.visible = false;
                text.visible = false;
                continue;
            }
            cube.visible = true;
            text.visible = true;

            this.initBarProperty(cube, text, data, this.key, index, columnKey, columnIndex);
            let textMaxWidth = this.width;
            let height = (data - parent.originalValue) * preHeight;
            let figureZ = 0;
            if (displayType == Bar3DChart.DISPLAY_H) {
                cube.x = (-this.width + perWidth) / 2 + columnIndex * (barSpaceWidth + perWidth);
                cube.width = perWidth;
                // cube.scaleX = perWidth / parent.width;
                cube.depth = cube.width * parent.depthRate;
                cube.scaleZ = 1;
                textMaxWidth = perWidth;
            } else if (displayType == Bar3DChart.DISPLAY_V) {
                cube.x = 0;
                cube.width = this.width;
                // cube.scaleX = this.width/parent.width;
                cube.depth = cube.width * parent.depthRate;
                // cube.scaleZ = preDepth / this.depth;
                figureZ = this.depth / 2;
                figureZ -= preDepth / 2;
                figureZ -= columnIndex * preDepth;
            }

            cube.height = this.height;
            // cube.scaleZ *= parent.depthRate;
            let rate = Math.abs(height) / this.height;
            cube.scaleY = rate;
            cube.y = -height / 2;
            cube.z = figureZ;

            let textString = this.getText(data, this.key);
            // textString = null;
            if (textString == null) {
                text.visible = false;
            } else {
                text.visible = true;
                text.text = this.getText(data, this.key);

                text.maxWidth = textMaxWidth;
                text.textAlign = 'center';
                text.z = cube.z;
                text.x = cube.x;
                let textY = cube.y;
                let fontsize = Math.floor(parent.getXZLATExtendLength());
                if (displayType == Bar3DChart.DISPLAY_H) {
                    fontsize = Math.floor(fontsize / this.barKeys.length);
                }
                text.fontSize = fontsize;
                let plusValue = (Math.abs(height) / 2 + fontsize);
                if (height >= 0) {
                    textY -= plusValue;
                } else {
                    textY += plusValue;
                }
                text.y = textY;
            }
        }

        let ctext = this.getColumnText(this.key);
        if (ctext == null) this.columnText.visible = false; else {
            this.columnText.rotateX = 45;
            this.columnText.x = 0;
            this.columnText.z = this.depth / 2;
            this.columnText.y = parent.getXZLATExtendLength() * 2 / 3;
            this.columnText.visible = true;
            this.columnText.text = ctext;
            this.columnText.fontSize = Math.floor(parent.getXZLATExtendLength());
        }

    }
}