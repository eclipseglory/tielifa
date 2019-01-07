'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var instance = void 0;
var _imageMap = Symbol('存储的图片列表');

var ImageManager = function () {
    function ImageManager() {
        _classCallCheck(this, ImageManager);

        if (instance) {
            return instance;
        }
        instance = this;
        this[_imageMap] = [];
    }

    _createClass(ImageManager, [{
        key: 'registerImage',
        value: function registerImage(name, src, properties, callback) {
            var image = new Image();
            var that = this;
            image.data = properties;
            image.onload = function (evt) {
                that[_imageMap][name] = { image: evt.target, property: evt.target.data };
                if (callback) {
                    callback(evt);
                }
            };
            image.src = src;
        }
    }, {
        key: 'getImage',
        value: function getImage(name, index) {
            var image = this[_imageMap][name].image;
            if (index == undefined) return image;

            var property = this[_imageMap][name].property;
            if (!property) return image;
            var column = property.column;
            var row = property.row;
            var total = column * row;
            if (index < 0 || index >= total) return image;

            var width = image.width;
            var height = image.height;
            var perWidth = width / column;
            var perHeight = height / row;
            var vIndex = Math.floor(index / column);
            var hIndex = Math.floor(index % column);
            var srcLeft = hIndex * perWidth;
            var srcTop = vIndex * perHeight;
            var srcBounds = { left: srcLeft, top: srcTop, width: perWidth, height: perHeight };
            return { image: image, bounds: srcBounds };
        }
    }, {
        key: 'images',
        get: function get() {
            var imgs = [];
            for (var key in this[_imageMap]) {
                imgs.push(this[_imageMap][key]);
            }
            return imgs;
        }
    }], [{
        key: 'getInstance',
        value: function getInstance() {
            if (!instance) new ImageManager();
            return instance;
        }
    }]);

    return ImageManager;
}();

exports.default = ImageManager;