import TempCanvas from "../texture/TempCanvas.js";

let TEMP_CANVAS = new TempCanvas("@_TEXTTOOLS_TEMPCANVAS");
let _fontMetricsCatch = {};
let TEST_CHAR = "É";
let METRICS_STRING = '|Éq';
let BASELINE_SYMBOL = 'M';
let BASELINE_MULTIPLIER = 1.4;
let _newlines = [
    0x000A, // line feed
    0x000D, // carriage return
];
let _breakingSpaces = [
    0x0009, // character tabulation
    0x0020, // space
    0x2000, // en quad
    0x2001, // em quad
    0x2002, // en space
    0x2003, // em space
    0x2004, // three-per-em space
    0x2005, // four-per-em space
    0x2006, // six-per-em space
    0x2008, // punctuation space
    0x2009, // thin space
    0x200A, // hair space
    0x205F, // medium mathematical space
    0x3000, // ideographic space
];

const SPACE_CHAR_CODE = 0x0020;

const BASELINE_ALPHABETIC = "alphabetic";
const BASELINE_TOP = "top";
const BASELINE_MIDDLE = "middle";
const BASELINE_HANGING = "hanging";
const BASELINE_IDEOGRAPHICS = "ideographic";
const BASELINE_BOTTOM = "bottom";

const ALIGN_START = "start";
const ALIGN_END = "end";
const ALIGN_LEFT = "left";
const ALIGN_RIGHT = "right";
const ALIGN_CENTER = "center";


// let defaultTextManager = null;
export default class TextTools {
    constructor() {

    }

    // static get defaultTextureManager() {
    //     return defaultTextManager;
    // }
    //
    // static set defaultTextureManager(t) {
    //     defaultTextManager = t;
    // }

    static get TEMP_CANVAS() {
        return TEMP_CANVAS;
    }

    static get SPACE_CHAR_CODE() {
        return SPACE_CHAR_CODE;
    }

    static isNewLineChar(char) {
        return _newlines.indexOf(char) != -1;
    }

    static isSpacesChar(char) {
        return _breakingSpaces.indexOf(char) != -1;
    }

    static get BASELINE_ALPHABETIC() {
        return BASELINE_ALPHABETIC;
    }

    static get BASELINE_TOP() {
        return BASELINE_TOP;
    }

    static get ALIGN_CENTER() {
        return ALIGN_CENTER;
    }

    static createTextlines(text, fontSize, fontFamily, fontWeight, fontStyle, textureManager) {
        if(textureManager == null) return null;
        // textureManager = textureManager || this.defaultTextureManager;
        let stringArray = TextTools.splitTextWithNewlineChar(text);
        let lineArray = [];
        let lineMaxWidth = 0;
        let fontMetrics = this.measureFont(fontFamily, fontWeight);
        for (let i = 0; i < stringArray.length; i++) {
            let line = {lineWidth: 0, textures: [], scale: 1};
            lineArray.push(line);
            let s = stringArray[i];
            for (let j = 0; j < s.length; j++) {
                let code = s.charCodeAt(j);

                if (TextTools.isNewLineChar(code)) {
                    code = TextTools.SPACE_CHAR_CODE;
                }
                if (TextTools.isSpacesChar(code)) {
                    let spaceWidth = fontMetrics.spaceCharWidthCent[code] * fontSize;
                    line.lineWidth += Math.floor(spaceWidth); //之前的计算都是四舍五入，这里截断，有可能会缩小误差哟
                    line.textures.push(spaceWidth);
                    continue;
                }

                let char = String.fromCharCode(code);
                let textureId = char + "@" + fontMetrics.id + "_" + fontSize.toString();
                let texture = null;
                if (textureManager != null) texture = textureManager.getTextureById(textureId);
                if (texture == null) {
                    if (textureManager != null) {
                        let result = TextTools.draw2dText(char, fontSize, fontFamily, fontWeight, fontStyle);
                        texture = textureManager.createTexture(result.canvas, textureId);
                        texture.textWidth = result.textWidth;
                    }
                }
                if(texture != null){
                    line.textures.push(texture);
                    line.lineWidth += texture.textWidth;
                }
            }
            lineMaxWidth = Math.max(lineMaxWidth, line.lineWidth);
        }
        return {lineMaxWidth: lineMaxWidth, lineArray: lineArray};
    }


    static getFontString(fontSize, fontFamily, fontWeight, fontStyle) {
        fontSize = (fontSize != null) ? fontSize : 32;

        fontFamily = fontFamily || "arial";
        fontFamily = fontFamily.trim().toLocaleLowerCase();

        fontWeight = fontWeight || "";
        fontWeight = fontWeight.trim().toLocaleLowerCase();

        fontStyle = fontStyle || "";
        fontStyle = fontStyle.trim().toLocaleLowerCase();

        let font = "";
        if (fontStyle !== "") {
            font = font + fontStyle + " ";
        }
        if (fontWeight !== "") {
            font = font + fontWeight + " ";
        }
        font = font + fontSize.toString() + "px ";
        if (fontFamily !== "") {
            font = font + fontFamily;
        }
        return font;
    }

    static getStartPointOffset(baseLine, textAlign, fontSize, textMetric, width) {
        baseLine = baseLine.toLowerCase().trim();
        textAlign = textAlign.toLowerCase().trim();
        let offset = {x: 0, y: 0};
        if (textAlign === ALIGN_LEFT || textAlign === ALIGN_START) {

        }
        if (textAlign === ALIGN_END || textAlign === ALIGN_RIGHT) {
            offset.x = -width;
        }
        if (textAlign === ALIGN_CENTER) {
            offset.x = (-width) / 2;
        }
        if (baseLine === BASELINE_ALPHABETIC) {
            offset.y -= textMetric.ascent * fontSize;
        }
        if (baseLine === BASELINE_HANGING) {
            offset.y -= textMetric.hangingBaseline * fontSize;
        }
        if (baseLine === BASELINE_TOP) {
            offset.y -= textMetric.topBaseline * fontSize;
        }
        if (baseLine === BASELINE_BOTTOM) {
            offset.y -= textMetric.fontSize * fontSize;
        }
        if (baseLine === BASELINE_IDEOGRAPHICS) {
            offset.y -= textMetric.fontSize * fontSize;
            offset.y += textMetric.ideographicBaseline * fontSize;
        }

        if (baseLine === BASELINE_MIDDLE) {
            offset.y -= textMetric.middle * fontSize;
        }
        return offset;
    }

    static splitTextWithNewlineChar(string) {
        return string.split('\n');
    }

    static draw2dText(text, fontSize, fontFamily, fontWeight, fontStyle) {
        let canvas = TEMP_CANVAS;
        let textMetrics = TextTools.measureText(text, fontSize, fontFamily, fontWeight, fontStyle);
        let width = textMetrics.width;
        if (fontStyle != null) fontStyle = fontStyle.trim().toLowerCase();
        if (fontStyle === 'italic') {
            width += textMetrics.extendWidth * fontSize;
        }
        canvas.width = Math.ceil(width);
        canvas.height = Math.round(textMetrics.fontSize * fontSize);
        if (canvas.width === 0 || canvas.height === 0) return;
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.fillStyle = "#FFFFFF";//必须白色
        ctx.font = textMetrics.font;
        ctx.textAlign = ALIGN_LEFT;
        ctx.textBaseline = BASELINE_ALPHABETIC;
        ctx.fillText(text, 0, textMetrics.ascent * fontSize);
        ctx.restore();
        return {canvas: TEMP_CANVAS, textWidth: textMetrics.width};
    }

    static measureText(text, fontSize, fontFamily, fontWeight, fontStyle) {
        let canvas = TEMP_CANVAS;
        let font = this.getFontString(fontSize, fontFamily, fontWeight, fontStyle);
        let fontProperties = this.measureFont(fontFamily, fontWeight);
        let copyProperties = {};
        for (let p in fontProperties) {
            copyProperties[p] = fontProperties[p];
        }
        let ctx = canvas.getContext('2d');
        ctx.font = font;
        copyProperties.width = ctx.measureText(text).width;
        copyProperties.font = font;
        return copyProperties;
    }

    static measureFont(fontFamily, fontWeight) {
        let canvas = TEMP_CANVAS;
        let fontSize = 100;

        fontFamily = fontFamily || "arial";
        fontFamily = fontFamily.trim().toLocaleLowerCase();

        fontWeight = fontWeight || "";
        fontWeight = fontWeight.trim().toLocaleLowerCase();

        let fontStyle = "italic";

        let font = "";
        let fontKey = "";
        if (fontStyle !== "") {
            font = font + fontStyle + " ";
        }
        if (fontWeight !== "") {
            font = font + fontWeight + " ";
            fontKey = fontKey + fontWeight;
        }
        font = font + fontSize.toString() + "px ";
        if (fontFamily !== "") {
            font = font + fontFamily;
            fontKey = fontKey + "_" + fontFamily;
        }

        let properties = _fontMetricsCatch[fontKey];
        if (properties != null) return properties;
        properties = {};
        let ctx = canvas.getContext('2d');
        ctx.save();
        ctx.font = font;


        let spaceCharWidthMap = {};
        for (let i = 0; i < _breakingSpaces.length; i++) {
            let spaceChar = String.fromCharCode(_breakingSpaces[i]);
            spaceCharWidthMap[_breakingSpaces[i]] = ctx.measureText(spaceChar).width / 100;
        }
        properties.spaceCharWidthCent = spaceCharWidthMap;
        let textMetric = ctx.measureText(TEST_CHAR);
        let width = Math.ceil(textMetric.width * 2);
        let height = Math.ceil(textMetric.width * 3);
        canvas.width = width;
        canvas.height = height;
        ctx.font = font;

        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#000000";
        ctx.textBaseline = BASELINE_BOTTOM;
        ctx.fillText(TEST_CHAR, 0, height);

        let imageData = ctx.getImageData(0, 0, width, height).data;
        let i = height - 1;
        let j = 0;
        let stop = false;
        for (; i >= 0; i--) {
            for (j = 0; j < width; j++) {
                let index = i * width + j;
                index *= 4;
                if (imageData[index] !== 255) {
                    stop = true;
                    break;
                }
            }
            if (stop) break;
        }
        let extendWidthStart = j;
        let extendWidthEnd = extendWidthStart;
        let bottom = i + 1;
        for (; i >= 0; i--) {
            stop = true;
            for (j = 0; j < width; j++) {
                let index = i * width + j;
                index *= 4;
                if (imageData[index] !== 255) {
                    stop = false;
                    extendWidthEnd = j;
                    break;
                }
            }
            if (stop) break;
        }
        let top = i + 1;
        stop = false;
        for (; i >= 0; i--) {
            for (j = 0; j < width; j++) {
                let index = i * width + j;
                index *= 4;
                if (imageData[index] !== 255) {
                    stop = true;
                    break;
                }
            }
            if (stop) break;
        }
        let head = i + 1;
        for (; i >= 0; i--) {
            stop = true;
            for (j = 0; j < width; j++) {
                let index = i * width + j;
                index *= 4;
                if (imageData[index] !== 255) {
                    stop = false;
                    break;
                }
            }
            if (stop) break;
        }
        let begin = i + 1;

        properties.fontSize = height - begin + 1;
        properties.ascent = bottom - begin + 1;

        properties.extendWidth = (extendWidthEnd - extendWidthStart + 1) / (bottom - top + 1) * properties.fontSize;
        properties.alphabeticBaseline = properties.ascent;


        canvas.width = width;
        height = properties.fontSize;
        canvas.height = height;
        ctx.font = font;

        //计算尾部离bottom的距离:
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#000000";
        ctx.textBaseline = BASELINE_BOTTOM;
        ctx.fillText("j", textMetric.width / 2, height);

        imageData = ctx.getImageData(0, 0, width, height).data;

        i = height - 1;
        stop = false;
        for (; i >= 0; i--) {
            for (j = 0; j < width; j++) {
                let index = i * width + j;
                index *= 4;
                if (imageData[index] !== 255) {
                    stop = true;
                    break;
                }
            }
            if (stop) break;
        }
        let bottomSpace = height - i;
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#000000";
        ctx.textBaseline = BASELINE_TOP;
        ctx.fillText("j", textMetric.width / 2, 0);

        imageData = ctx.getImageData(0, 0, width, height).data;

        i = height - 1;
        stop = false;
        for (; i >= 0; i--) {
            for (j = 0; j < width; j++) {
                let index = i * width + j;
                index *= 4;
                if (imageData[index] !== 255) {
                    stop = true;
                    break;
                }
            }
            if (stop) break;
        }
        properties.topBaseline = height - i - bottomSpace;
        properties.emHeight = properties.fontSize - properties.topBaseline;
        properties.middleBaseline = properties.emHeight / 2 + properties.topBaseline;
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#000000";
        ctx.textBaseline = BASELINE_HANGING;
        ctx.fillText("j", textMetric.width / 2, 0);
        imageData = ctx.getImageData(0, 0, width, height).data;

        i = height - 1;
        stop = false;
        for (; i >= 0; i--) {
            for (j = 0; j < width; j++) {
                let index = i * width + j;
                index *= 4;
                if (imageData[index] !== 255) {
                    stop = true;
                    break;
                }
            }
            if (stop) break;
        }
        properties.hangingBaseline = height - i - bottomSpace;


        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#000000";
        ctx.textBaseline = BASELINE_IDEOGRAPHICS;
        ctx.fillText("j", textMetric.width / 2, height);
        imageData = ctx.getImageData(0, 0, width, height).data;

        i = height - 1;
        stop = false;
        for (; i >= 0; i--) {
            for (j = 0; j < width; j++) {
                let index = i * width + j;
                index *= 4;
                if (imageData[index] !== 255) {
                    stop = true;
                    break;
                }
            }
            if (stop) break;
        }
        let deltaHeight = height - i - bottomSpace;
        properties.ideographicsBaseline = -deltaHeight;

        for (let p in properties) {
            if (typeof properties[p] !== "object")
                properties[p] = properties[p] / fontSize;
        }

        properties.id = fontKey;
        properties.fontFamily = fontFamily;
        properties.fontWeight = fontWeight;
        // let finalProperties = {};
        // Tools.createReadOnlyObject(properties, finalProperties);
        ctx.restore();
        _fontMetricsCatch[fontKey] = properties;
        return properties;
    }

}