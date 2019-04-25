export default class TempCanvas {
    constructor() {
        if (typeof wx !== 'undefined') {
            return wx.createCanvas();
        }
        let element = document.createElement('canvas');
        return element;
    }
}