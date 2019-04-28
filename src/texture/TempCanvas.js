export default class TempCanvas {
    constructor(id) {
        if (typeof wx !== 'undefined') {
            return wx.createCanvas();
        }
        let element = document.createElement('canvas');
        if(id != null) element.id = id;
        return element;
    }
}