'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BMFontParser = require('./BMFontParser.js');

var _BMFontParser2 = _interopRequireDefault(_BMFontParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var instance = null;

var BMFontManager = function () {
    function BMFontManager() {
        _classCallCheck(this, BMFontManager);

        this.pageImages = [];
        this.fontImageMap = {};
        this.fontMap = {};
        this.loadCount = 0;
    }

    _createClass(BMFontManager, [{
        key: 'getBMFont',
        value: function getBMFont(fontFamily) {
            return this.fontMap[fontFamily.trim()];
        }
    }, {
        key: 'getFontImage',
        value: function getFontImage(fontFamily, id) {
            return this.fontImageMap[fontFamily.trim()][id];
        }
    }, {
        key: 'loadBMFont',
        value: function loadBMFont(fntFileURL, textureManager, gl, callbacks) {
            callbacks = callbacks || {};
            fntFileURL = fntFileURL.replace(/\\/g, '/');
            var parentDir = '';
            var index = fntFileURL.lastIndexOf('/');
            if (index != -1) {
                parentDir = fntFileURL.slice(0, index);
                parentDir += '/';
            }
            var request = new XMLHttpRequest();
            request.open('GET', fntFileURL, true);
            request.responseType = 'text';
            var that = this;
            request.onload = function (evt) {
                if (request.status == 200) {
                    var _ret = function () {
                        var loadCount = 0;
                        var xml = request.responseText;
                        var font = _BMFontParser2.default.parseXML(xml);
                        var pageCount = font.pages.length;
                        if (font == null) {
                            if (callbacks.fail) {
                                callbacks.fail('can not parse xml fnt file,make sure it\'s xml type');
                                return {
                                    v: void 0
                                };
                            }
                        } else {
                            (function () {
                                var key = font.fontFamily.toLocaleLowerCase().trim();
                                if (font.isBold) {
                                    key += '_bold';
                                }
                                if (font.isItalic) {
                                    key += '_italic';
                                }
                                that.fontMap[key] = font;
                                that.fontImageMap[key] = {};
                                loadCount = 0;
                                for (var i = 0; i < font.pages.length; i++) {
                                    var page = font.pages[i];
                                    var image = new Image();
                                    image.pageId = page.id;
                                    image.onload = function (evt) {
                                        var img = evt.target;
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
                            })();
                        }
                    }();

                    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
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

    }, {
        key: 'initDefaultFont',
        value: function initDefaultFont(textureManager, gl) {
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
    }]);

    return BMFontManager;
}();

exports.default = BMFontManager;