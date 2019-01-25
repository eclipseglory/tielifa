'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TAG_FONT = 'font';
var TAG_INFO = 'info';
var TAG_COMMON = 'common';
var ATT_FACE = 'face';
var ATT_SIZE = 'size';

var BMFontParser = function () {
    function BMFontParser() {
        _classCallCheck(this, BMFontParser);
    }

    _createClass(BMFontParser, null, [{
        key: 'parseXML',
        value: function parseXML(content) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(content, "text/xml");
            var root = xmlDoc.getElementsByTagName(TAG_FONT);
            if (root == null) return null;

            var font = {
                fontFamily: null, size: 0, isBold: false, isItalic: false, charset: null, isUnicode: false,
                stretchH: 0, isSmooth: false, aa: 0, leftPadding: 0, topPadding: 0, rightPadding: 0, bottomPadding: 0,
                leftSpacing: 0, rightSpacing: 0, outline: 0
            };
            // 解析info节点
            var infos = xmlDoc.getElementsByTagName(TAG_INFO);
            if (infos == null || infos.length == 0) return null;
            var info = infos[0];
            font.fontFamily = info.getAttribute(ATT_FACE);
            font.size = Number.parseInt(info.getAttribute(ATT_SIZE));
            font.isBold = Number.parseInt(info.getAttribute("bold")) == 1;
            font.isItalic = Number.parseInt(info.getAttribute("italic")) == 1;
            font.charset = info.getAttribute("charset");
            font.isUnicode = Number.parseInt(info.getAttribute("unicode")) == 1;
            font.stretchH = Number.parseInt(info.getAttribute("stretchH"));
            font.isSmooth = Number.parseInt(info.getAttribute("smooth")) == 1;
            font.aa = Number.parseInt(info.getAttribute("aa"));
            var paddingStr = info.getAttribute('padding');
            var paddingArray = paddingStr.split(',');
            font.leftPadding = Number.parseInt(paddingArray[0]);
            font.rightPadding = Number.parseInt(paddingArray[1]);
            font.topPadding = Number.parseInt(paddingArray[2]);
            font.bottomPadding = Number.parseInt(paddingArray[3]);

            var spacingStr = info.getAttribute('spacing');
            var spacingArray = spacingStr.split(',');
            font.leftSpacing = Number.parseInt(spacingArray[0]);
            font.rightSpacing = Number.parseInt(spacingArray[1]);

            font.outline = Number.parseInt(info.getAttribute("outline"));

            // 解析common节点
            var commons = xmlDoc.getElementsByTagName('common');
            if (commons == null || commons.length == 0) return null;
            var c = commons[0];
            var common = {
                lineHeight: 0,
                base: 0,
                scaleW: 0,
                scaleH: 0,
                pages: 0,
                packed: 0,
                alphaChnl: 0,
                redChnl: 0,
                greenChnl: 0,
                blueChnl: 0
            };
            common.lineHeight = Number.parseInt(c.getAttribute("lineHeight"));
            common.base = Number.parseInt(c.getAttribute("base"));
            common.scaleW = Number.parseInt(c.getAttribute("scaleW"));
            common.scaleH = Number.parseInt(c.getAttribute("scaleH"));
            common.pages = Number.parseInt(c.getAttribute("pages"));
            common.alphaChnl = Number.parseInt(c.getAttribute("alphaChnl"));
            common.redChnl = Number.parseInt(c.getAttribute("redChnl"));
            common.greenChnl = Number.parseInt(c.getAttribute("greenChnl"));
            common.blueChnl = Number.parseInt(c.getAttribute("blueChnl"));
            font.common = common;

            // 解析pages节点
            var pagesNode = xmlDoc.getElementsByTagName('pages');
            if (pagesNode == null || pagesNode.length == 0) return null;
            var pages = pagesNode[0];
            font.pages = [];
            for (var i = 0; i < pages.childNodes.length; i++) {
                var page = pages.childNodes[i];
                if (page.nodeType == Node.ELEMENT_NODE) {
                    var p = {};
                    p.file = page.getAttribute('file');
                    p.id = Number.parseInt(page.getAttribute("id"));
                    font.pages.push(p);
                }
            }
            // 解析chars
            var charsNodes = xmlDoc.getElementsByTagName('chars');
            if (charsNodes == null || charsNodes.length == 0) return font;
            var charsNode = charsNodes[0];
            font.charsCount = Number.parseInt(charsNode.getAttribute('count'));
            font.chars = [];
            for (var _i = 0; _i < charsNode.childNodes.length; _i++) {
                var charNode = charsNode.childNodes[_i];
                if (charNode.nodeType == Node.TEXT_NODE) continue;
                var char = {};
                char.id = Number.parseInt(charNode.getAttribute("id"));
                char.x = Number.parseInt(charNode.getAttribute("x"));
                char.y = Number.parseInt(charNode.getAttribute("y"));
                char.width = Number.parseInt(charNode.getAttribute("width"));
                char.height = Number.parseInt(charNode.getAttribute("height"));
                char.xoffset = Number.parseInt(charNode.getAttribute("xoffset"));
                char.yoffset = Number.parseInt(charNode.getAttribute("yoffset"));
                char.xadvance = Number.parseInt(charNode.getAttribute("xadvance"));
                char.page = Number.parseInt(charNode.getAttribute("page"));
                char.chnl = Number.parseInt(charNode.getAttribute("chnl"));
                font.chars[char.id] = char;
            }
            // font.chars.sort(function (a, b) {
            //     return a.id - b.id;
            // });

            //解析kernings
            var kerningsNodes = xmlDoc.getElementsByTagName('kernings');
            if (kerningsNodes == null || kerningsNodes.length == 0) return font;
            var kerningsNode = kerningsNodes[0];
            font.kerningsCount = Number.parseInt(kerningsNode.getAttribute('count'));
            font.kernings = [];
            for (var _i2 = 0; _i2 < kerningsNode.childNodes.length; _i2++) {
                var kerningNode = kerningsNode.childNodes[_i2];
                if (kerningNode.nodeType == Node.TEXT_NODE) continue;
                var kerning = {};
                kerning.first = Number.parseInt(kerningNode.getAttribute("first"));
                kerning.second = Number.parseInt(kerningNode.getAttribute("second"));
                kerning.amount = Number.parseInt(kerningNode.getAttribute("amount"));
                font.kernings.push(kerning);
            }
            font.kernings.sort(function (a, b) {
                if (a.first - b.first == 0) {
                    return a.second - b.second;
                } else {
                    return a.first - b.first;
                }
            });
            return font;
        }
    }]);

    return BMFontParser;
}();

exports.default = BMFontParser;