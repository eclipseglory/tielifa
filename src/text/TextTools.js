let _fontMetricsCatch = {};
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

export default class TextTools {
    constructor() {

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

    static get ALIGN_CENTER(){
        return ALIGN_CENTER;
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
        if (baseLine === BASELINE_ALPHABETIC) {
            offset.y -= textMetric.ascent * fontSize;
        }
        if (baseLine === BASELINE_HANGING) {
            offset.y -= textMetric.headOffset2 * fontSize;
        }
        if (baseLine === BASELINE_TOP) {
            offset.y -= textMetric.headOffset * fontSize;
        }
        if (baseLine === BASELINE_BOTTOM) {
            offset.y -= textMetric.fontSize * fontSize;
        }
        if (baseLine === BASELINE_IDEOGRAPHICS) {
            offset.y -= textMetric.fontSize * fontSize;
        }

        if (baseLine === BASELINE_MIDDLE) {
            offset.y -= textMetric.middle * fontSize;
        }
        return offset;
    }

    static splitTextWithNewlineChar(string) {
        return string.split('\n');
    }

    static draw2dText(canvas, text, fontSize, fontFamily, fontWeight, fontStyle) {
        let textMetrics = TextTools.measureText(canvas, text, fontSize, fontFamily, fontWeight, fontStyle);
        let width = textMetrics.width;
        canvas.width = Math.ceil(width);
        canvas.height = Math.ceil(textMetrics.fontSize * fontSize);
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
        return canvas;
    }

    static measureText(canvas, text, fontSize, fontFamily, fontWeight, fontStyle) {
        let font = this.getFontString(fontSize, fontFamily, fontWeight, fontStyle);
        let fontProperties = this.measureFont(canvas, fontFamily, fontWeight, fontStyle);
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

    static measureFont(canvas, fontFamily, fontWeight, fontStyle) {

        let fontSize = 100;

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
        let fontKey = font;
        font = font + fontSize.toString() + "px ";
        if (fontFamily !== "") {
            font = font + fontFamily;
            fontKey = fontKey + fontFamily;
        }

        let properties = _fontMetricsCatch[fontKey];
        if (properties != null) return properties;
        properties = {};
        let ctx = canvas.getContext('2d');
        ctx.save();
        ctx.font = font;

        let metricsString = METRICS_STRING + BASELINE_SYMBOL;

        let spaceCharWidthMap = {};
        for (let i = 0; i < _breakingSpaces.length; i++) {
            let spaceChar = String.fromCharCode(_breakingSpaces[i])
            spaceCharWidthMap[_breakingSpaces[i]] = ctx.measureText(spaceChar).width / 100;
        }
        properties.spaceCharWidthCent = spaceCharWidthMap;

        const width = Math.ceil(ctx.measureText(metricsString).width);
        let baseline = Math.ceil(ctx.measureText(BASELINE_SYMBOL).width);
        const height = 2 * baseline;
        baseline = baseline * BASELINE_MULTIPLIER | 0;
        canvas.width = width;
        canvas.height = height;
        ctx.font = font;

        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, width, height);

        ctx.textBaseline = BASELINE_ALPHABETIC;
        ctx.fillStyle = '#000000';
        ctx.fillText(metricsString, 0, baseline);

        let imagedata = ctx.getImageData(0, 0, width, height).data;
        const pixels = imagedata.length;
        const line = width * 4;

        let i = 0;
        let idx = 0;
        let stop = false;

        // ascent. scan from top to bottom until we find a non red pixel
        for (i = 0; i < baseline; ++i) {
            for (let j = 0; j < line; j += 4) {
                if (imagedata[idx + j] !== 255) {
                    stop = true;
                    break;
                }
            }
            if (!stop) {
                idx += line;
            } else {
                break;
            }
        }

        properties.ascent = baseline - i;

        idx = pixels - line;
        stop = false;

        // descent. scan from bottom to top until we find a non red pixel
        for (i = height; i > baseline; --i) {
            for (let j = 0; j < line; j += 4) {
                if (imagedata[idx + j] !== 255) {
                    stop = true;
                    break;
                }
            }

            if (!stop) {
                idx -= line;
            } else {
                break;
            }
        }

        properties.descent = i - baseline;
        properties.fontSize = properties.ascent + properties.descent;

        metricsString = "|";
        let w = Math.ceil(ctx.measureText(metricsString).width);
        let h = properties.fontSize;
        canvas.width = w;
        canvas.height = h;
        // canvas.style.width = w +"px";
        // canvas.style.height = h +"px";

        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, w, h);
        ctx.font = font;
        ctx.textBaseline = BASELINE_BOTTOM;
        ctx.fillStyle = '#000000';
        ctx.fillText(metricsString, 0, h);

        imagedata = ctx.getImageData(0, 0, w, h).data;
        let offset = -1;
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                let index = i * w + j;
                index *= 4;
                if (imagedata[index] !== 255) {
                    offset = i - 2;
                    break;
                }
            }
            if (offset !== -1) {
                break;
            }
        }
        properties.headOffset2 = offset;


        metricsString = "E";
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, w, h);

        // w = Math.ceil(ctx.measureBMText(metricsString).width);

        // ctx.font = font;
        ctx.textBaseline = BASELINE_BOTTOM;
        ctx.fillStyle = '#000000';
        ctx.fillText(metricsString, 0, h);

        imagedata = ctx.getImageData(0, 0, w, h).data;
        offset = -1;
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                let index = i * w + j;
                index *= 4;
                if (imagedata[index] !== 255) {
                    offset = i;
                    break;
                }
            }
            if (offset !== -1) {
                break;
            }
        }
        properties.headOffset = offset;
        properties.middle = Math.ceil(offset + (properties.fontSize - offset) / 2);
        properties.fontSize = properties.fontSize / fontSize;
        properties.headOffset = properties.headOffset / fontSize;
        properties.headOffset2 = properties.headOffset2 / fontSize;
        properties.middle = properties.middle / fontSize;
        properties.ascent = properties.ascent / fontSize;
        properties.descent = properties.descent / fontSize;
        properties.id = fontKey;

        ctx.restore();
        _fontMetricsCatch[fontKey] = properties;
        return properties;
    }
}