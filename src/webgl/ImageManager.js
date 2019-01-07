let instance;
let _imageMap = Symbol('存储的图片列表');
export default class ImageManager {
    constructor() {
        if (instance) {
            return instance;
        }
        instance = this;
        this[_imageMap] = [];
    }

    static getInstance() {
        if (!instance) new ImageManager();
        return instance;
    }

    get images() {
        let imgs = [];
        for (let key in this[_imageMap]) {
            imgs.push(this[_imageMap][key]);
        }
        return imgs;
    }

    registerImage(name, src, properties, callback) {
        let image = new Image();
        let that = this;
        image.data = properties;
        image.onload = function (evt) {
            that[_imageMap][name] = {image: evt.target, property: evt.target.data};
            if (callback) {
                callback(evt);
            }
        }
        image.src = src;
    }

    getImage(name, index) {
        let image = this[_imageMap][name].image;
        if (index == undefined)
            return image;

        let property = this[_imageMap][name].property;
        if (!property)
            return image;
        let column = property.column;
        let row = property.row;
        let total = column * row;
        if (index < 0 || index >= total)
            return image;

        let width = image.width;
        let height = image.height;
        let perWidth = width / column;
        let perHeight = height / row;
        let vIndex = Math.floor(index / column);
        let hIndex = Math.floor(index % column);
        let srcLeft = hIndex * perWidth;
        let srcTop = vIndex * perHeight;
        let srcBounds = {left: srcLeft, top: srcTop, width: perWidth, height: perHeight};
        return {image: image, bounds: srcBounds};
    }
}