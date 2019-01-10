'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./w3color.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _instance = void 0;

var Color = function () {
    function Color() {
        _classCallCheck(this, Color);

        if (_instance) {
            return _instance;
        }
        _instance = this;
        this.colorMap = {};
    }

    _createClass(Color, [{
        key: 'convertStringToColor',
        value: function convertStringToColor(string) {
            string = string.toLowerCase();
            var that = this;
            // if (Color.isHEXString(string)) {
            //     return getColorViaHex(string);
            // }
            if (Color.isRGBAString(string)) {
                return this.rgba2vec(string);
            }
            // if (Color.isRGBString(string)) {
            //     return this.rgb2vec(string);
            // }
            if (Color.isHSLAString(string)) {
                return this.hsla2vet3(string);
            }
            // if (Color.isHSLString(string)) {
            //     return this.hsl2vet3(string);
            // }

            function getColorViaHex(string) {
                var vec3 = that.colorMap[string];
                if (vec3 != undefined) return vec3;
                vec3 = that.convertHEXToVet3(string);
                that.colorMap[string] = vec3;
                return vec3;
            }

            return this.getVec(string, string, 1);
            // return this.convertKeywordToVet3(string);
        }
    }, {
        key: 'hsla2vet3',
        value: function hsla2vet3(hsl) {
            var temp = hsl;
            var vec3 = this.colorMap[temp];
            if (vec3 != undefined) return vec3;
            hsl = hsl.match(new RegExp(",", "g"));
            hsl = hsl || [];
            var a = 1.0;
            if (hsl.length == 3) {
                hsl = temp;
                var i = hsl.lastIndexOf(',');
                var i1 = hsl.lastIndexOf(')');
                var as = hsl.substring(i + 1, i1);
                a = parseFloat(as);
                hsl = hsl.substring(0, i);
                hsl += ')';
            } else {
                hsl = temp;
            }
            hsl = hsl.replace('a', '');
            var v = w3color(hsl);
            if (v.valid) {
                vec3 = [v.r, v.g, v.b, a];
                this.colorMap[temp] = vec3;
                return vec3;
            } else {
                return [0, 0, 0, 1];
            }
        }
    }, {
        key: 'rgba2vec',
        value: function rgba2vec(rgb) {
            var temp = rgb;
            var vec3 = this.colorMap[temp];
            if (vec3 != undefined) return vec3;
            rgb = rgb.match(new RegExp(",", "g"));
            rgb = rgb || [];
            var a = 1.0;
            if (rgb.length == 3) {
                rgb = temp;
                var i = rgb.lastIndexOf(',');
                var i1 = rgb.lastIndexOf(')');
                var as = rgb.substring(i + 1, i1);
                a = parseFloat(as);
                rgb = rgb.substring(0, i);
                rgb += ')';
            } else {
                rgb = temp;
            }
            rgb = rgb.replace('a', '');
            return this.getVec(rgb, temp, a);
        }
    }, {
        key: 'getVec',
        value: function getVec(string, key, alpha) {
            var v = w3color(string);
            if (v.valid) {
                v = v.toRgb();
                var vec3 = [v.r, v.g, v.b, alpha];
                if (this.colorMap[key] == undefined) this.colorMap[key] = vec3;
                return vec3;
            } else {
                return [0, 0, 0, 1];
            }
        }
    }], [{
        key: 'getInstance',
        value: function getInstance() {
            if (!_instance) {
                _instance = new Color();
            }
            return _instance;
        }
    }, {
        key: 'isRGBAString',
        value: function isRGBAString(string) {
            if (string) {
                if (string.indexOf('rgba') == 0) {
                    return true;
                }
            }
            return false;
        }
    }, {
        key: 'isHSLAString',
        value: function isHSLAString(string) {
            if (string) {
                if (string.indexOf('hsla') == 0) {
                    return true;
                }
            }
            return false;
        }
    }]);

    return Color;
}();

exports.default = Color;