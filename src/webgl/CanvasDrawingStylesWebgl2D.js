'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _lineWidth = Symbol('线宽度,默认1');
var _lineCap = Symbol('线连接样式，"butt", "round", "square" (默认: "butt")');
var _lineJoin = Symbol('线连接样式，"round", "bevel", "miter" (默认: "miter")');
var _miterLimit = Symbol('默认10');

var _font = Symbol('文字字体大小等，默认"10px sans-serif"');
var _textAlign = Symbol('文字对齐,"start", "end", "left", "right", "center" (默认: "start")');
var _textBaseline = Symbol('文字纵向对齐，"top", "hanging", "middle", "alphabetic", "ideographic", "bottom" (默认: "alphabetic")');

var CanvasDrawingStylesWebgl2D = function () {
    function CanvasDrawingStylesWebgl2D() {
        _classCallCheck(this, CanvasDrawingStylesWebgl2D);

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

    _createClass(CanvasDrawingStylesWebgl2D, [{
        key: 'clone',
        value: function clone() {
            var c = new CanvasDrawingStylesWebgl2D();
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
    }, {
        key: 'lineCap',
        get: function get() {
            return this[_lineCap];
        },
        set: function set(lineCap) {
            this[_lineCap] = lineCap;
        }

        // line caps/joins

    }, {
        key: 'lineWidth',
        get: function get() {
            return this[_lineWidth];
        },
        set: function set(lineWidth) {
            this[_lineWidth] = lineWidth;
        }
    }, {
        key: 'lineJoin',
        get: function get() {
            return this[_lineJoin];
        },
        set: function set(lineJoin) {
            this[_lineJoin] = lineJoin;
        }
    }, {
        key: 'miterLimit',
        get: function get() {
            return this[_miterLimit];
        },
        set: function set(miterLimit) {
            this[_miterLimit] = miterLimit;
        }

        // 没有实现的：
        // dashed lines
        // void setLineDash(sequence<unrestricted double> segments); // (default: empty)
        // sequence<unrestricted double> getLineDash();
        // attribute unrestricted double lineDashOffset;


        // text

    }, {
        key: 'font',
        get: function get() {
            return this[_font];
        },
        set: function set(font) {
            this[_font] = font;
        }
    }, {
        key: 'textAlign',
        get: function get() {
            return this[_textAlign];
        },
        set: function set(textAlign) {
            this[_textAlign] = textAlign;
        }
    }, {
        key: 'textBaseline',
        get: function get() {
            return this[_textBaseline];
        },
        set: function set(textBaseline) {
            this[_textBaseline] = textBaseline;
        }
    }]);

    return CanvasDrawingStylesWebgl2D;
}();

exports.default = CanvasDrawingStylesWebgl2D;