export default class Texture {
    constructor(p) {
        p = p || {};
        this.id = p['id'];
        if(p['x'] != undefined){
            this.x = p['x'];
        }else{
            this.x = -1;
        }

        if(p['y'] != undefined){
            this.y = p['y'];
        }else{
            this.y = -1;
        }

        if(p['width'] != undefined){
            this.width = p['width'];
        }else{
            this.width = -1;
        }

        if(p['height'] != undefined){
            this.height = p['height'];
        }else{
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