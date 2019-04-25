import Tools from "../utils/Tools.js";
import Texture from "./Texture.js";

const SINGLE_TYPE = 'single';
const H_TYPE = 'h_t';
const V_TYPE = 'v_t';

export default class MainTexture {
    constructor(p) {
        this.index = p['index'];
        if (this.index == null) this.index = -1;
        this.width = p['width'] || 1024;
        this.height = p['height'] || 1024;
        this.textures = [];
        this.constId = 0;
        this.regions = [];
        this.space = p['space'] || 1;
        this.glTexture = null;
        this.regions.push({id: this.constId, width: this.width, height: this.height, x: 0, y: 1, type: SINGLE_TYPE});
    }

    static get SINGLE_TYPE(){
        return SINGLE_TYPE;
    }

    /**
     * @deprecated
     * @param images
     * @returns {{remainImages: Array, parkedInfo: Array}}
     */
    park(images) {
        let image = images;
        if (!(image instanceof Array)) {
            let im = image;
            image = [];
            image.push(im);
        }
        let parkedImage = [];
        let infos = [];
        // let max = this.maxPage;
        // let count = 0;
        while (parkedImage.length !== image.length) {
            let info = this.parkImages(images, parkedImage);
            if (info.paredInfo.length === 0) break;
            Tools.addAllInArray(infos, info.textures);
            parkedImage = info.parkedImages;
            // count++;
            // if (count >= max) break;
        }
        let remained = [];
        if (parkedImage.length !== image.length) {
            for (let i = 0; i < image.length; i++) {
                let img = image[i];
                if (parkedImage.indexOf(img) === -1) {
                    remained.push(img);
                }
            }
        }
        return {parkedInfo: infos, remainImages: remained};
    }

    /**
     * @deprecated
     * @param images
     * @param parkedImages
     * @returns {{textures: Array, parkedImages: (*|Array)}}
     */
    parkImages(images, parkedImages) {
        parkedImages = parkedImages || [];
        // let initRegion = {id: constId, width: this.width, height: this.height, x: 0, y: 0, type: SINGLE_TYPE};
        let regions = this.regions;
        // regions.push(initRegion);
        let textures = [];
        // let images = [];
        // for (let i = 0; i < this.image.length; i++) {
        //     images.push(this.image[i]);
        // }
        for (let i = 0; i < images.length; i++) {
            let mostFit = {value: -1, img: null, region: null};
            for (let i = 0; i < regions.length; i++) {
                let region = regions[i];
                let fit = this.getFitImage(region, images, parkedImages);
                if (fit.img != null) {
                    if (fit.value > mostFit.value) {
                        mostFit.value = fit.value;
                        mostFit.img = fit.img;
                        mostFit.region = region;
                    }
                }
            }
            if (mostFit.region != null) {
                this.constId++;
                let img = mostFit.img;
                let re = mostFit.region;
                let texture = new Texture({
                    id: img.id,
                    img: img,
                    x: re.x,
                    y: re.y,
                    width: img.width,
                    height: img.height
                });
                // let parkInfo = {
                //     id: img.id,
                //     img: img,
                //     x: re.x,
                //     y: re.y,
                //     width: img.width,
                //     height: img.height
                // };
                textures.push(texture);
                this.splitRegion(img, this.constId, re, regions);
                parkedImages.push(img);
            }
        }
        // return parkedInformation;
        return {textures: textures, parkedImages: parkedImages};
    }

    splitRegion(img, newRegionId, region, regions) {
        // 横向分：
        let hRegion1 = {
            id: newRegionId,
            x: img.width + this.space + region.x,
            y: region.y,
            width: region.width - img.width - this.space,
            height: img.height,
            type: H_TYPE
        };
        let hRegion2 = {
            id: newRegionId,
            x: region.x,
            y: region.y + img.height + this.space,
            width: region.width,
            height: region.height - img.height - this.space,
            type: H_TYPE
        };

        //纵向分：
        let vRegion1 = {
            id: newRegionId,
            x: img.width + this.space + region.x,
            y: region.y,
            width: region.width - img.width - this.space,
            height: region.height,
            type: V_TYPE
        };
        let vRegion2 = {
            id: newRegionId,
            x: region.x,
            y: region.y + img.height + this.space,
            width: img.width,
            height: region.height - img.height - this.space,
            type: V_TYPE
        };

        this.deleteRegion(region, regions);
        Tools.removeObjFromArray(region, regions);
        regions.push(hRegion1);
        regions.push(hRegion2);
        regions.push(vRegion1);
        regions.push(vRegion2);
    }

    deleteRegion(region, regions) {
        let type = region.type;
        let id = region.id;
        let deleteType = V_TYPE;
        if (type === V_TYPE) deleteType = H_TYPE;
        //删除以前的横向区域，并把另外一个纵向区域改成独立区域
        let del = [];
        let complete = 0;
        let total = 3;
        for (let i = 0; i < regions.length; i++) {
            let r = regions[i];
            if (r === region) continue;
            if (r.id === id) {
                if (r.type === type) {
                    r.type = SINGLE_TYPE;
                    complete++
                } else if (r.type === deleteType) {
                    del.push(r);
                    complete++
                }
            }
            if (complete === total) {
                break;
            }
        }
        for (let i = 0; i < del.length; i++) {
            Tools.removeObjFromArray(del[i], regions);
            // regions.remove(del[i]);
        }
    }

    parkImageInRegion(image, region) {
        this.constId++;
        let img = image;
        let re = region;
        let texture = new Texture({
            // id: img.src,
            img: img,
            x: re.x,
            y: re.y,
            width: img.width,
            height: img.height,
            page: this.index
        });
        this.textures.push(texture);
        this.splitRegion(img, this.constId, re, this.regions);
        return texture;
    }

    getFitRegion(image) {
        let fit = {value: -2, region: null, index: this.index};
        for (let i = 0; i < this.regions.length; i++) {
            let region = this.regions[i];
            if (image.width <= region.width && image.height <= region.height) {
                let f = image.width / region.width + image.height / region.height;
                if (f > fit.value) {
                    fit.value = f;
                    fit.region = region;
                }
            }
        }
        return fit;
    }

    /**
     * @deprecated
     * @param region
     * @param images
     * @param parkedImages
     * @returns {{img: null, value: number}}
     */
    getFitImage(region, images, parkedImages) {
        let fit = {value: -1, img: null};
        for (let i = 0; i < images.length; i++) {
            let img = images[i];
            // let img = image.img;
            if (parkedImages.indexOf(img) !== -1) continue;
            if (img.width <= region.width && img.height <= region.height) {
                let f = img.width / region.width + img.height / region.height;
                if (f > fit.value) {
                    fit.value = f;
                    fit.img = img;
                }
            }
        }
        return fit;
    }

}