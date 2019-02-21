const TAG_FONT = 'font';
const TAG_INFO = 'info';
const TAG_COMMON = 'common';
const ATT_FACE = 'face';
const ATT_SIZE = 'size';
export default class BMFontParser {
    constructor() {
    }

    static parseXML(content) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(content, "text/xml");
        let root = xmlDoc.getElementsByTagName(TAG_FONT);
        if (root == null) return null;

        let font = {
            fontFamily: null, size: 0, isBold: false, isItalic: false, charset: null, isUnicode: false,
            stretchH: 0, isSmooth: false, aa: 0, leftPadding: 0, topPadding: 0, rightPadding: 0, bottomPadding: 0,
            leftSpacing: 0, rightSpacing: 0, outline: 0
        };
        // 解析info节点
        let infos = xmlDoc.getElementsByTagName(TAG_INFO);
        if (infos == null || infos.length == 0) return null;
        let info = infos[0];
        font.fontFamily = info.getAttribute(ATT_FACE);
        font.size = Number.parseInt(info.getAttribute(ATT_SIZE));
        font.isBold = Number.parseInt(info.getAttribute("bold")) == 1;
        font.isItalic = Number.parseInt(info.getAttribute("italic")) == 1;
        font.charset = info.getAttribute("charset");
        font.isUnicode = Number.parseInt(info.getAttribute("unicode")) == 1;
        font.stretchH = Number.parseInt(info.getAttribute("stretchH"));
        font.isSmooth = Number.parseInt(info.getAttribute("smooth")) == 1;
        font.aa = Number.parseInt(info.getAttribute("aa"));
        let paddingStr = info.getAttribute('padding');
        let paddingArray = paddingStr.split(',');
        font.leftPadding = Number.parseInt(paddingArray[0]);
        font.rightPadding = Number.parseInt(paddingArray[1]);
        font.topPadding = Number.parseInt(paddingArray[2]);
        font.bottomPadding = Number.parseInt(paddingArray[3]);

        let spacingStr = info.getAttribute('spacing');
        let spacingArray = spacingStr.split(',');
        font.leftSpacing = Number.parseInt(spacingArray[0]);
        font.rightSpacing = Number.parseInt(spacingArray[1]);

        font.outline = Number.parseInt(info.getAttribute("outline"));

        // 解析common节点
        let commons = xmlDoc.getElementsByTagName(TAG_COMMON);
        if (commons == null || commons.length == 0) return null;
        let c = commons[0];
        let common = {
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
        let pagesNode = xmlDoc.getElementsByTagName('pages');
        if (pagesNode == null || pagesNode.length == 0) return null;
        let pages = pagesNode[0];
        font.pages = [];
        for (let i = 0; i < pages.childNodes.length; i++) {
            let page = pages.childNodes[i];
            if (page.nodeType == Node.ELEMENT_NODE) {
                let p = {};
                p.file = page.getAttribute('file');
                p.id = Number.parseInt(page.getAttribute("id"));
                font.pages.push(p);
            }
        }
        // 解析chars
        let charsNodes = xmlDoc.getElementsByTagName('chars');
        if (charsNodes == null || charsNodes.length == 0) return font;
        let charsNode = charsNodes[0];
        font.charsCount = Number.parseInt(charsNode.getAttribute('count'));
        font.chars = [];
        for (let i = 0; i < charsNode.childNodes.length; i++) {
            let charNode = charsNode.childNodes[i];
            if (charNode.nodeType == Node.TEXT_NODE) continue;
            let char = {};
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


        //解析kernings
        let kerningsNodes = xmlDoc.getElementsByTagName('kernings');
        if (kerningsNodes == null || kerningsNodes.length == 0) return font;
        let kerningsNode = kerningsNodes[0];
        font.kerningsCount = Number.parseInt(kerningsNode.getAttribute('count'));
        font.kernings = [];
        for (let i = 0; i < kerningsNode.childNodes.length; i++) {
            let kerningNode = kerningsNode.childNodes[i];
            if (kerningNode.nodeType == Node.TEXT_NODE) continue;
            let kerning = {};
            kerning.first = Number.parseInt(kerningNode.getAttribute("first"));
            kerning.second = Number.parseInt(kerningNode.getAttribute("second"));
            kerning.amount = Number.parseInt(kerningNode.getAttribute("amount"));
            font.kernings.push(kerning);
        }
        font.kernings.sort(function (a, b) {
            if(a.first - b.first == 0){
                return a.second - b.second;
            }else{
                return a.first-b.first;
            }
        });
        return font;
    }
}