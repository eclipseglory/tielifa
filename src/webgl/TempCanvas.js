'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TempCanvas = function TempCanvas() {
    _classCallCheck(this, TempCanvas);

    // 这是微信版本的代码：
    // return wx.createCanvas();
    return document.createElement('canvas');
};

exports.default = TempCanvas;