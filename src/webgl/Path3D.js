"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Path3D = function () {
    function Path3D() {
        _classCallCheck(this, Path3D);

        this.subPathArray = [];
    }

    _createClass(Path3D, [{
        key: "addSubPath",
        value: function addSubPath(subPath) {
            this.subPathArray.push(subPath);
        }
    }, {
        key: "clean",
        value: function clean() {
            this.subPathArray.length = 0;
        }
    }, {
        key: "subPathNumber",
        get: function get() {
            return this.subPathArray.length;
        }
    }, {
        key: "lastSubPath",
        get: function get() {
            if (this.subPathNumber != 0) {
                return this.subPathArray[this.subPathNumber - 1];
            }
        }
    }]);

    return Path3D;
}();

exports.default = Path3D;