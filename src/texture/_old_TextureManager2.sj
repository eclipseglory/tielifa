import TempCanvas from "./TempCanvas.js";
import Texture from "./Texture.js";

let _imageCatch = Symbol('图片缓存');
let _textCatch = Symbol('texture缓存');
let _textureMap = Symbol('贴图表');
export default class _old_TextureManager2 {
    constructor(maxSize, maxTextureNum, space) {
        this.maxWidth = maxSize || 1;
        this.maxHeight = maxSize || 1;
        this.maxTextureNum = maxTextureNum || 1;
        this[_imageCatch] = [];
        this[_textCatch] = [];
        this[_textureMap] = {};
        this.imageDataArray = new Array(this.maxTextureNum);
        this.textureArray = new Array(this.maxTextureNum);
        this.space = space || 3;
        // 一个离屏的canvas，单态
        this.canvas = new TempCanvas();
        this.ctx = canvas.getContext('2d');
    }

    getMapLength(map) {
        let size = 0, key;
        for (key in map) {
            if (map.hasOwnProperty(key)) size++;
        }
        return size;
    }

    getTexture(image, gl, autoGenerateTexture) {
        let index = this.imageCatch.indexOf(image);
        if (index === -1) {
            return this.registerImageData(null, image, gl, autoGenerateTexture);
        } else {
            return this[_textCatch][index];
        }
    }

    getTextureById(id, index) {
        let t = this[_textureMap][id];
        if (index != null && t != null) {
            return t.splitedTextures[index];
        }
        return t;
    }

    registerTexture(id, gl, image, src, callbacks, split) {
        id = id || this.getMapLength(this[_textureMap]).toString();
        if (image == null) {
            if (src != null) {
                let img;
                if (typeof wx !== 'undefined') {
                    img = wx.createImage();
                } else {
                    img = new Image();
                }
                image = img;
                image.tid = id;
                image.crossOrigin = '';
                let that = this;
                image.onload = function (evt) {
                    let img = evt.target;
                    let texture = that.registerImageData(img.tid, img, gl, true);
                    if (callbacks) {
                        if (split) {
                            let column = split.column;
                            let row = split.row;
                            let total = row * column;
                            if (total > 1) texture.splitedTextures.length = 0;
                            let width = img.width;
                            let height = img.height;
                            let perWidth = width / column;
                            let perHeight = height / row;
                            for (let index = 0; index < total; index++) {
                                let vIndex = Math.floor(index / column);
                                let hIndex = Math.floor(index % column);
                                let srcLeft = hIndex * perWidth;
                                let srcTop = vIndex * perHeight;
                                let child = new Texture({
                                    id: img.tid + "_" + index,
                                    x: srcLeft + texture.x,
                                    y: srcTop + texture.y,
                                    width: perWidth,
                                    height: perHeight,
                                    page: texture.page
                                });
                                texture.splitedTextures.push(child);
                            }
                        }
                        if (callbacks.success) {
                            callbacks.success({texture: texture, img: img, target: img});
                        }
                    }
                };
                image.onerror = function () {
                    if (callbacks) {
                        if (callbacks.failed) {
                            callbacks.failed();
                        }
                    }
                };
                image.src = src;
            }
        } else {
            let texture = this.registerImageData(id, image, gl, true);
            if (callbacks) {
                if (callbacks.success) {
                    callbacks.success(texture);
                }
            }
        }
        if (callbacks) {
            if (callbacks.complete) {
                callbacks.complete();
            }
        }
    }


    registerImageData(textureId, image, gl, autoGenerateTexture) {
        if (image == null) {
            console.error('Image can not be null');
            return;
        }
        if (autoGenerateTexture == null) autoGenerateTexture = false;
        let x = 0;
        let y = 0;
        let imgW = image.width;
        let imgH = image.height;
        if (imgW > this.maxWidth || imgH > this.maxHeight) {
            throw new Error('图片大小超过了最大限制：' + this.maxWidth + " x " + this.maxHeight);
        }
        if (this.imageCatch.indexOf(image) === -1) {
            let canvas = this.canvas;
            let ctx = this.ctx;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            /**
             * 利用一个离屏canvas的2d context重新绘制一个套image并生成texture
             * 这个离屏canvas的0,0点是一个白色的像素点，所以绘制其他image从[0,1]开始
             */
            let currentTextureIndex = -1;
            for (let i = 0; i < this.imageDataArray.length; i++) {
                let imageData = this.imageDataArray[i];
                if (imageData == null) {
                    imageData = {imageData: undefined, startX: 0, startY: 0, width: 0, height: 0};
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
                    let width = image.width;
                    let height = image.height;
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
                        console.warn('图片超过贴图内存最大尺寸');
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

            if (currentTextureIndex !== -1) {
                this.imageCatch.push(image);
                let textureInfo = new Texture();
                textureInfo.id = textureId;
                textureInfo.x = x;
                textureInfo.y = y;
                textureInfo.width = imgW;
                textureInfo.height = imgH;
                textureInfo.page = currentTextureIndex;
                if (autoGenerateTexture) {
                    this.createTexture(gl, currentTextureIndex, canvas)
                }
                this[_textureMap][textureId] = textureInfo;
                this[_textCatch].push(textureInfo);
                return textureInfo;
            }
        }
    }

    createAllTexture(gl) {
        if (gl == null) return;
        let canvas = new TempCanvas();
        for (let i = 0; i < this.textureArray.length; i++) {
            this.createTexture(gl, i, canvas);
        }
    }

    createTexture(gl, index, canvas) {
        if (gl == null || index == null || index == -1) return;
        if (canvas == null) {
            canvas = new TempCanvas();
        }
        let ctx = canvas.getContext('2d');
        let texture = this.textureArray[index];
        let imgData = this.imageDataArray[index];
        if (imgData != null) {
            canvas.width = imgData.width;
            canvas.height = imgData.height;
            ctx.putImageData(imgData.imageData, 0, 0);
            if (texture == null) {
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

    get imageCatch() {
        return this[_imageCatch];
    }

    cleanImageData() {
        this.imageCatch.length = 0;
        for (let i = 0; i < this.imageDataArray.length; i++) {
            let imageData = this.imageDataArray[i];
            if (imageData)
                imageData.imageData = null;
        }
    }

    static isPOT(value) {
        return value > 0 && ((value - 1) & value) === 0;
    }
}