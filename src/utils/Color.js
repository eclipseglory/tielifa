import W3Color from "./W3Color.js";

let _instance;
export default class Color {
    constructor() {
        if (_instance) {
            return _instance;
        }
        _instance = this;
        this.colorMap = {};
    }

    static getInstance() {
        if (!_instance) {
            _instance = new Color();
        }
        return _instance;
    }

    convertStringToColor(string) {
        let vec3 = this.colorMap[string];
        if (vec3 != undefined) return vec3;
        string = string.toLowerCase();
        if (Color.isRGBAString(string)) {
            return this.rgba2vec(string);
        }
        if (Color.isHSLAString(string)) {
            return this.hsla2vet3(string);
        }
        return this.getVec(string, string, 1);
    }


    static isRGBAString(string) {
        if (string) {
            if (string.indexOf('rgba') == 0) {
                return true;
            }
        }
        return false;
    }

    static isHSLAString(string) {
        if (string) {
            if (string.indexOf('hsla') == 0) {
                return true;
            }
        }
        return false;
    }


    hsla2vet3(hsl) {
        let temp = hsl;
        let vec3 = this.colorMap[temp];
        if (vec3 != undefined) return vec3;
        hsl = hsl.match(new RegExp(",", "g"));
        hsl = hsl || [];
        let a = 1.0;
        if (hsl.length == 3) {
            hsl = temp;
            let i = hsl.lastIndexOf(',');
            let i1 = hsl.lastIndexOf(')');
            let as = hsl.substring(i + 1, i1);
            a = parseFloat(as);
            hsl = hsl.substring(0, i);
            hsl += ')';
        } else {
            hsl = temp;
        }
        hsl = hsl.replace('a', '');
        let v = w3color(hsl);
        if (v.valid) {
            vec3 = [v.r, v.g, v.b, a];
            this.colorMap[temp] = vec3;
            return vec3;
        } else {
            return [0, 0, 0, 1];
        }
    }

    rgba2vec(rgb) {
        let temp = rgb;
        let vec3 = this.colorMap[temp];
        if (vec3 != undefined) return vec3;
        rgb = rgb.match(new RegExp(",", "g"));
        rgb = rgb || [];
        let a = 1.0;
        if (rgb.length == 3) {
            rgb = temp;
            let i = rgb.lastIndexOf(',');
            let i1 = rgb.lastIndexOf(')');
            let as = rgb.substring(i + 1, i1);
            a = parseFloat(as);
            rgb = rgb.substring(0, i);
            rgb += ')';
        } else {
            rgb = temp;
        }
        rgb = rgb.replace('a', '');
        return this.getVec(rgb, temp, a);
    }


    getVec(string, key, alpha) {
        let vec3 = this.colorMap[key];
        if (vec3 != undefined) return vec3;
        let v = new W3Color(string);
        if (v.valid) {
            let v1 = v.toRgb();
            let vec3 = [v1.r, v1.g, v1.b, alpha];
            if (this.colorMap[key] == undefined)
                this.colorMap[key] = vec3;
            return vec3;
        } else {
            return [0, 0, 0, 1];
        }
    }
}