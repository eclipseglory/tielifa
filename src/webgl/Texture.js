export default class Texture {
    constructor(p) {
        p = p || {};
        this.id = p['id'];
        this.x = p['x'] || -1;
        this.y = p['y'] || -1;
        this.width = p['width'] || -1;
        this.height = p['height'] || -1;
        this.page = p['page'] || 0;
        this.index = this.page;
    }

    get index() {
        return this.page;
    }

    set index(index) {
        this.page = index;
    }
}