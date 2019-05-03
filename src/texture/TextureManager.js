import TempCanvas from "./TempCanvas.js";
import MainTexture from "./MainTexture.js";
import Texture from "./Texture.js";

let _textureMap = Symbol('贴图表');
export default class TextureManager {
    constructor(maxSize, gl, maxTextureNum, space, tempCanvas) {

        if (gl == null) throw new Error('GL context can\'t be null');
        this.gl = gl;
        this.space = space || 3;
        // 一个离屏的canvas
        this.canvas = tempCanvas || new TempCanvas();
        this.ctx = this.canvas.getContext('2d');

        this.maxWidth = maxSize || 1;
        this.maxHeight = maxSize || 1;
        this.maxTextureNum = maxTextureNum || 1;
        this[_textureMap] = {};
        this.textureArray = new Array(this.maxTextureNum);
        //动态贴图占总贴图的1/3
        this.dynamicIndex = this.maxTextureNum - Math.floor(this.maxTextureNum / 3);
        for (let i = 0; i < this.textureArray.length; i++) {
            let mainTexture = new MainTexture({
                width: this.maxWidth,
                height: this.maxHeight,
                space: this.space,
                index: i
            });
            this._initMainTexture(mainTexture);
            this.textureArray[i] = mainTexture;
        }
    }

    _initMainTexture(texture) {
        let canvas = this.canvas;
        let ctx = this.ctx;
        let gl = this.gl;
        canvas.width = texture.width;
        canvas.height = texture.height;
        ctx.clearRect(0, 0, texture.width, texture.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1, 1); // 这个像素点是给一般fill用的texture颜色
        // let data = ctx.getImageData(0, 0, texture.width, texture.height);
        let glTexture = gl.createTexture();
        texture.glTexture = glTexture;
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
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

    loadImage(src, gl) {

    }


    getMapLength(map) {
        let size = 0, key;
        for (key in map) {
            if (map.hasOwnProperty(key)) size++;
        }
        return size;
    }

    getTexture(image, id, split, dynamic) {
        if (id == null) id = image.src;
        let texture = this[_textureMap][id];
        if (texture == null) {
            texture = this.createTexture(image, id, dynamic);
            if (split != null) {
                let column = split.column;
                let row = split.row;
                let total = row * column;
                if (total > 1) texture.splitedTextures.length = 0;
                let width = texture.width;
                let height = texture.height;
                let perWidth = width / column;
                let perHeight = height / row;
                for (let index = 0; index < total; index++) {
                    let vIndex = Math.floor(index / column);
                    let hIndex = Math.floor(index % column);
                    let srcLeft = hIndex * perWidth;
                    let srcTop = vIndex * perHeight;
                    let child = new Texture({
                        id: texture.id + "_" + index,
                        x: srcLeft + texture.x,
                        y: srcTop + texture.y,
                        width: perWidth,
                        height: perHeight,
                        page: texture.page
                    });
                    texture.splitedTextures.push(child);
                }
            }
        }
        return texture;
    }

    getTextureById(id, index) {
        let t = this[_textureMap][id];
        if (index != null && t != null) {
            return t.splitedTextures[index];
        }
        return t;
    }

    clean(clearAll) {
        if (clearAll == null) clearAll = false;
        let startIndex = this.dynamicIndex;
        let endIndex = this.textureArray.length;
        if (clearAll) {
            startIndex = 0;
        }
        for (let i = startIndex; i < endIndex; i++) {
            let mainTexture = this.textureArray[i];
            mainTexture.regions.length = 0;
            mainTexture.constId = 0;
            mainTexture.regions.push({
                id: mainTexture.constId,
                width: mainTexture.width,
                height: mainTexture.height,
                x: 0,
                y: 1,
                type: MainTexture.SINGLE_TYPE
            });
            if (!clearAll) {
                for (let k = 0; k < mainTexture.textures.length; k++) {
                    let t = mainTexture.textures[k];
                    delete this[_textureMap][t.id];
                }
            }
            mainTexture.textures = [];

        }
        if (clearAll)
            this[_textureMap] = {};
    }

    createTexture(drawable, id, dynamic) {
        if (id == null) id = drawable.src;
        if (id == null) throw new Error('ID can not be null');
        let gl = this.gl;
        if (dynamic == null) dynamic = false;
        let startTextureIndex = 0;
        let endTextureIndex = this.dynamicIndex;
        if (dynamic) {
            startTextureIndex = this.dynamicIndex;
            endTextureIndex = this.textureArray.length;
        }
        let mostFit = {value: -2, index: -1, region: null};
        for (let i = startTextureIndex; i < endTextureIndex; i++) {
            let mainTexture = this.textureArray[i];
            let fitInfo = mainTexture.getFitRegion(drawable);
            if (fitInfo.value > mostFit.value) {
                mostFit = fitInfo;
            }
        }
        if (mostFit.index === -1)
            throw new Error('cannot find fit texture for this image, you can increase maxTextureNum to fix this issue');
        let mainTexture = this.textureArray[mostFit.index];
        let imgData = null;
        if (drawable.getContext != null) {
            // 说明drawable就是一个canvas
            imgData = drawable;
        } else {
            let canvas = this.canvas;
            let ctx = this.ctx;
            canvas.width = drawable.width;
            canvas.height = drawable.height;
            ctx.clearRect(0, 0, drawable.width, drawable.height);
            ctx.drawImage(drawable, 0, 0);
            imgData = canvas;
        }

        let region = mostFit.region;
        gl.bindTexture(gl.TEXTURE_2D, mainTexture.glTexture);
        // target, level, xoffset, yoffset, format, type, ImageData? pixels
        gl.texSubImage2D(gl.TEXTURE_2D, 0, region.x, region.y, gl.RGBA, gl.UNSIGNED_BYTE, imgData);
        gl.bindTexture(gl.TEXTURE_2D, null);

        let texture = mainTexture.parkImageInRegion(drawable, mostFit.region);
        texture.id = id;

        this[_textureMap][id] = texture;
        return texture;
    }

    static isPOT(value) {
        return value > 0 && ((value - 1) & value) === 0;
    }
}