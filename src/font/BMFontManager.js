import BMFontParser from "./BMFontParser.js";

let instance = null;

export default class BMFontManager {
    constructor() {
        this.pageImages = [];
        this.fontImageMap = {};
        this.fontMap = {};
        this.loadCount = 0;
    }


    getBMFont(fontFamily) {
        return this.fontMap[fontFamily.trim()];
    }

    getFontImage(fontFamily, id) {
        return this.fontImageMap[fontFamily.trim()][id];
    }

    loadBMFont(fntFileURL, textureManager, gl, callbacks) {
        callbacks = callbacks || {};
        fntFileURL = fntFileURL.replace(/\\/g, '/');
        let parentDir = '';
        let index = fntFileURL.lastIndexOf('/');
        if (index != -1) {
            parentDir = fntFileURL.slice(0, index);
            parentDir += '/';
        }
        let request = new XMLHttpRequest();
        request.open('GET', fntFileURL, true);
        request.responseType = 'text';
        let that = this;
        request.onload = function (evt) {
            if (request.status == 200) {
                let loadCount = 0;
                let xml = request.responseText;
                let font = BMFontParser.parseXML(xml);
                let pageCount = font.pages.length;
                if (font == null) {
                    if (callbacks.fail) {
                        callbacks.fail('can not parse xml fnt file,make sure it\'s xml type');
                        return;
                    }
                } else {
                    let key = font.fontFamily.toLocaleLowerCase().trim();
                    if (font.isBold) {
                        key += '_bold';
                    }
                    if (font.isItalic) {
                        key += '_italic';
                    }
                    that.fontMap[key] = font;
                    that.fontImageMap[key] = {};
                    loadCount = 0;
                    for (let i = 0; i < font.pages.length; i++) {
                        let page = font.pages[i];
                        let image = new Image();
                        image.pageId = page.id;
                        image.onload = function (evt) {
                            let img = evt.target;
                            that.fontImageMap[key][img.pageId] = img;
                            textureManager.registerImageData(img, gl, true);
                            loadCount++;
                            if (loadCount == pageCount) {
                                // 说明全部加载完毕
                                if (callbacks.success) {
                                    callbacks.success();
                                }
                            }
                        };
                        image.onerror = function (evt) {
                            if (callbacks.fail) {
                                callbacks.fail('cant load image', evt);
                            }
                        };
                        image.src = parentDir + page.file;
                    }
                }
            } else {
                if (callbacks.fail) {
                    callbacks.fail(request.statusText);
                }
            }
        };
        request.send(null);
        if (callbacks.complete) {
            callbacks.complete();
        }
    }

    /**
     * @deprecated
     * @param textureManager
     * @param gl
     */
    initDefaultFont(textureManager, gl) {
        // let font = BMFontParser.parseXML(defaultXML);
        // let key = font.fontFamily.toLocaleLowerCase().trim();
        // if (font.isBold) {
        //     key += '_bold';
        // }
        // if (font.isItalic) {
        //     key += '_italic';
        // }
        // this.fontMap[key] = font;
        // this.fontImageMap[key] = {};
        // this.loadCount = 0;
        // for (let i = 0; i < font.pages.length; i++) {
        //     let page = font.pages[i];
        //     // 内置的是base64的文件
        //     let image = new Image();
        //     image.pageId = page.id;
        //     let that = this;
        //     image.onload = function (evt) {
        //         let img = evt.target;
        //         that.fontImageMap[key][img.pageId] = img;
        //         textureManager.registerImageData(img, gl, true);
        //         that.loadCount++;
        //     };
        //     image.src = this.pageImages[page.id];
        // }
        // return;
    }
}