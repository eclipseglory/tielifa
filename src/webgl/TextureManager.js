'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TempCanvas = require('./TempCanvas.js');

var _TempCanvas2 = _interopRequireDefault(_TempCanvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _imageCatch = Symbol('图片缓存');
var _textCatch = Symbol('texture缓存');

var TextureManager = function () {
    function TextureManager(maxWidth, maxHeight, maxTextureNum, space) {
        _classCallCheck(this, TextureManager);

        this.maxWidth = maxWidth || 1;
        this.maxHeight = maxHeight || 1;
        this.maxTextureNum = maxTextureNum || 1;
        this[_imageCatch] = [];
        this[_textCatch] = [];
        this.imageDataArray = new Array(this.maxTextureNum);
        this.textureArray = new Array(this.maxTextureNum);
        this.space = space || 3;
    }

    _createClass(TextureManager, [{
        key: 'getTexture',
        value: function getTexture(image, gl, autoGenerateTexture) {
            var index = this.imageCatch.indexOf(image);
            if (index == -1) {
                return this.registerImageData(image, gl, autoGenerateTexture);
            } else {
                return this[_textCatch][index];
            }
        }
    }, {
        key: 'registerImageData',
        value: function registerImageData(image, gl, autoGenerateTexture) {
            if (image == undefined || image == null) {
                console.error('Image can not be null');
                return;
            }
            if (autoGenerateTexture == undefined) autoGenerateTexture = false;
            var x = 0;
            var y = 0;
            var imgW = image.width;
            var imgH = image.height;
            if (imgW > this.maxWidth || imgH > this.maxHeight) {
                throw new Error('图片大小超过了最大限制：' + this.maxWidth + " x " + this.maxHeight);
                return;
            }
            if (this.imageCatch.indexOf(image) == -1) {
                var canvas = new _TempCanvas2.default(); // 这个地方用个类是为了便于微信小程序的适配
                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                /**
                 * 利用一个离屏canvas的2d context重新绘制一个套image并生成texture
                 * 这个离屏canvas的0,0点是一个黑色的像素点，所以绘制其他image从[0,1]开始
                 */
                var currentTextureIndex = -1;
                for (var i = 0; i < this.imageDataArray.length; i++) {
                    var imageData = this.imageDataArray[i];
                    if (imageData == undefined) {
                        imageData = { imageData: undefined, startX: 0, startY: 0, width: 0, height: 0 };
                        this.imageDataArray[i] = imageData;
                        canvas.width = image.width;
                        canvas.height = image.height + 1;
                        x = 0;
                        y = 1;
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, 1, 1); // 这个像素点是给一般fill用的texture颜色
                        ctx.drawImage(image, 0, 1);
                        // 保存当前绘制出来的图像数据
                        imageData.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        imageData.startX = canvas.width + this.space;
                        imageData.startY = 1;
                        imageData.width = canvas.width;
                        imageData.height = canvas.height;
                    } else {
                        var width = image.width;
                        var height = image.height;
                        x = imageData.startX;
                        y = imageData.startY;
                        if (x + width > this.maxWidth) {
                            x = 0; // 从下一行开始画
                            y = imageData.height + this.space;
                            canvas.width = Math.max(imageData.width, width);
                            canvas.height = y + height;
                        } else {
                            canvas.width = Math.max(imageData.width, x + width);
                            canvas.height = Math.max(imageData.height, y + height);
                        }
                        if (y + height > this.maxHeight) {
                            // 图片已经超过最大可以绘制的空间，换另外一个texture
                            console.error('图片超过贴图内存最大尺寸');
                            continue;
                        }
                        // 将之前的像素数据放入新的canvas中
                        ctx.putImageData(imageData.imageData, 0, 0);
                        ctx.drawImage(image, x, y);
                        imageData.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        imageData.startX = x + width + this.space;
                        imageData.startY = y;
                        imageData.width = canvas.width;
                        imageData.height = canvas.height;
                    }
                    currentTextureIndex = i;
                    break;
                }

                if (currentTextureIndex != -1) {
                    this.imageCatch.push(image);
                    var textureInfo = { x: x, y: y, width: imgW, height: imgH, index: currentTextureIndex };
                    if (autoGenerateTexture) {
                        this.createTexture(gl, currentTextureIndex, canvas);
                    }
                    this[_textCatch].push(textureInfo);
                    return textureInfo;
                }
            }
        }
    }, {
        key: 'createAllTexture',
        value: function createAllTexture(gl) {
            if (gl == undefined) return;
            var canvas = new _TempCanvas2.default();
            var ctx = canvas.getContext('2d');
            for (var i = 0; i < this.textureArray.length; i++) {
                this.createTexture(gl, i, canvas);
            }
        }
    }, {
        key: 'createTexture',
        value: function createTexture(gl, index, canvas) {
            if (gl == undefined || index == undefined || index == -1) return;
            if (canvas == undefined) {
                canvas = new _TempCanvas2.default();
            }
            var ctx = canvas.getContext('2d');
            var texture = this.textureArray[index];
            var imgData = this.imageDataArray[index];
            if (imgData != undefined) {
                canvas.width = imgData.width;
                canvas.height = imgData.height;
                ctx.putImageData(imgData.imageData, 0, 0);
                if (texture == undefined) {
                    texture = gl.createTexture();
                    this.textureArray[index] = texture;
                }
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                if (TextureManager.isPOT(canvas.width) && TextureManager.isPOT(canvas.height)) {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                    gl.generateMipmap(gl.TEXTURE_2D);
                } else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                }
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
        }
    }, {
        key: 'imageCatch',
        get: function get() {
            return this[_imageCatch];
        }
    }], [{
        key: 'isPOT',
        value: function isPOT(value) {
            return value > 0 && (value - 1 & value) === 0;
        }
    }]);

    return TextureManager;
}();

exports.default = TextureManager;