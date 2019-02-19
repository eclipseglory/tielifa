let _lineWidth = Symbol('线宽度,默认1');
let _lineCap = Symbol('线连接样式，"butt", "round", "square" (默认: "butt")');
let _lineJoin = Symbol('线连接样式，"round", "bevel", "miter" (默认: "miter")');
let _miterLimit = Symbol('默认10');

let _font = Symbol('文字字体大小等，默认"10px sans-serif"');
let _textAlign = Symbol('文字对齐,"start", "end", "left", "right", "center" (默认: "start")');
let _textBaseline = Symbol('文字纵向对齐，"top", "hanging", "middle", "alphabetic", "ideographic", "bottom" (默认: "alphabetic")');
export default class CanvasDrawingStylesWebgl2D {
    constructor() {
        this[_lineWidth] = 1;
        this[_lineCap] = "butt";
        this[_lineJoin] = "miter";
        this[_miterLimit] = 10;
        this.font = '10px sans-serif';
        this.textAlign = 'start';
        this.textBaseline = 'alphabetic';
        this.fontFamily = 'Arial';
        this.fontSize = 32;
    }

    get lineCap() {
        return this[_lineCap];
    }

    set lineCap(lineCap) {
        this[_lineCap] = lineCap;
    }


    // line caps/joins
    get lineWidth() {
        return this[_lineWidth];
    }

    set lineWidth(lineWidth) {
        this[_lineWidth] = lineWidth;
    }

    get lineJoin() {
        return this[_lineJoin];
    }

    set lineJoin(lineJoin) {
        this[_lineJoin] = lineJoin;
    }

    get miterLimit() {
        return this[_miterLimit];
    }

    set miterLimit(miterLimit) {
        this[_miterLimit] = miterLimit;
    }

    // 没有实现的：
    // dashed lines
    // void setLineDash(sequence<unrestricted double> segments); // (default: empty)
    // sequence<unrestricted double> getLineDash();
    // attribute unrestricted double lineDashOffset;


    // text
    get font() {
        return this[_font];
    }

    set font(font) {
        this[_font] = font;
    }

    get textAlign() {
        return this[_textAlign];
    }

    set textAlign(textAlign) {
        this[_textAlign] = textAlign;
    }

    get textBaseline() {
        return this[_textBaseline];
    }

    set textBaseline(textBaseline) {
        this[_textBaseline] = textBaseline;
    }

    clone() {
        let c = new CanvasDrawingStylesWebgl2D();
        c.textBaseline = this.textBaseline;
        c.textAlign = this.textAlign;
        c.font = this.font;
        c.lineCap = this.lineCap;
        c.lineJoin = this.lineJoin;
        c.lineWidth = this.lineWidth;
        c.fontFamily = this.fontFamily;
        c.fontSize = this.fontSize;
        return c;
    }
}