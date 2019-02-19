export default class TempCanvas {
    constructor() {
        if (typeof wx !== 'undefined') {
            return wx.createCanvas();
        }
        return document.createElement('canvas');
    }
}