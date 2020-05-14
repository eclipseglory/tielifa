import Figure3D from "./Figure3D.js";
import TextTools from "../text/TextTools.js";
import Mat4 from "../math/Mat4.js";

export default class Text extends Figure3D {
    constructor(p) {
        p = p || {};
        super(p);
        this._color = p['color'] || "#FFFFFF";
        this._text = p['text'];
        this._fontFamily = p['fontFamily'] || 'arial';
        this._fontSize = p['fontSize'] || 32;
        this._fontWeight = p['fontWeight'];
        this._fontStyle = p['fontStyle'];
        this._textAlign = p['textAlign'] || 'left';
        this._maxWidth = p['maxWidth'];
        this._width = null;
        this._height = null;
        this.fontMetrics = null;
        this._textlines = null;

    }

    fireDirty() {
        this._width = null;
        this._height = null;
        this._textlines = null;
        super.fireDirty();
    }

    get color() {
        return this._color;
    }

    set color(value) {
        if (this._color === value) return;
        this._color = value;
        this.fireDirty();
    }

    get fontFamily() {
        return this._fontFamily;
    }

    set fontFamily(value) {
        if (this._fontFamily === value) return;
        this._fontFamily = value;
        this.fireDirty();
    }

    get fontSize() {
        return this._fontSize;
    }

    set fontSize(value) {
        if (this._fontSize === value) return;
        this._fontSize = value;
        this.fireDirty();
    }

    get fontWeight() {
        return this._fontWeight;
    }

    set fontWeight(value) {
        if (this._fontWeight === value) return;
        this._fontWeight = value;
        this.fireDirty();
    }

    get fontStyle() {
        return this._fontStyle;
    }

    set fontStyle(value) {
        if (this._fontStyle === value) return;
        this._fontStyle = value;
        this.fireDirty();
    }

    get textAlign() {
        return this._textAlign;
    }

    set textAlign(value) {
        if (this._textAlign === value) return;
        this._textAlign = value;
        this.fireDirty();
    }

    get maxWidth() {
        return this._maxWidth;
    }

    set maxWidth(value) {
        if (this._maxWidth === value) return;
        this._maxWidth = value;
        this.fireDirty();
    }

    get text() {
        return this._text;
    }

    set text(value) {
        if (value === this._text) return;
        this._text = value;
        this.fireDirty();
    }

    get width() {
        if (this._width == null) {
            this.calculateBounds();
        }
        return this._width;
    }

    get height() {
        if (this._height == null) {
            this.calculateBounds();
        }
        return this._height;
    }

    get depth() {
        return 0;
    }

    get scaleZ() {
        return 1;
    }

    calculateBounds() {
        if (this._text == null) return;
        if (this._width == null || this._height == null) {
            let stringArray = TextTools.splitTextWithNewlineChar(this._text);
            let width = 0;
            let fontMetrics = TextTools.measureFont(this._fontFamily, this._fontWeight);
            this._height = fontMetrics.fontSize * this.fontSize * stringArray.length;
            for (let i = 0; i < stringArray.length; i++) {
                let metrics = TextTools.measureText(this._text, this.fontSize, this.fontFamily, this.fontWeight, this.fontStyle);
                width = Math.max(width, metrics.width);
            }
            this._width = width;
            if (this._maxWidth != null && this._maxWidth < this._width) this._width = this._maxWidth;
        }
    }


    applyDrawingStyle(ctx) {
        super.applyDrawingStyle(ctx);
        ctx.fillStyle = this._color;
        ctx.fontFamily = this._fontFamily;
        ctx.fontSize = this._fontSize;
        ctx.fontWeight = this._fontWeight;
        ctx.fontStyle = this._fontStyle;
        ctx.textAlign = this._textAlign;
    }


    drawSelf(ctx) {
        if (this._textlines == null) {
            this.calculateBounds();
        }
        ctx.textBaseline = TextTools.BASELINE_TOP;
        ctx.fillText(this._text, 0, -this.height / 2, this._maxWidth, this.depth, this._textlines);
    }
}