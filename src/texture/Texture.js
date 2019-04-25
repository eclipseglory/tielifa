export default class Texture {
    constructor(p) {
        p = p || {};
        this.opacity = p['opacity'];
        if (this.opacity == null) this.opacity = true;
        this.id = p['id'];
        if (p['x'] != null) {
            this.x = p['x'];
        } else {
            this.x = -1;
        }

        if (p['y'] != null) {
            this.y = p['y'];
        } else {
            this.y = -1;
        }

        if (p['width'] != null) {
            this.width = p['width'];
        } else {
            this.width = -1;
        }

        if (p['height'] != null) {
            this.height = p['height'];
        } else {
            this.height = -1;
        }

        this.page = p['page'] || 0;
        this.index = this.page;
        this.splitedTextures = [];
    }

    get index() {
        return this.page;
    }

    set index(index) {
        this.page = index;
    }
}