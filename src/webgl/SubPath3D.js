"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TYPE_RECTANGLE = 0;
var TYPE_TRIANGLE = 1;
var TYPE_POLYGON = 2;
var TYPE_ELLIPSE = 3;

var SubPath3D = function () {
    function SubPath3D(startPoint, type) {
        _classCallCheck(this, SubPath3D);

        this.pointsArray = [];
        if (startPoint != undefined && startPoint != null) {
            this.pushPoint(startPoint);
        }
        this.isClosed = false;
        this.type = type || TYPE_POLYGON;
    }

    _createClass(SubPath3D, [{
        key: "close",
        value: function close() {
            this.isClosed = true;
        }
    }, {
        key: "getPoint",
        value: function getPoint(index) {
            return this.pointsArray[index];
        }
    }, {
        key: "clean",
        value: function clean() {
            this.pointsArray = []; // 这样比length = 0 效率高?
            this.isClosed = false;
            // this.pointsArray.length = 0;
        }
    }, {
        key: "pushPoint",
        value: function pushPoint(point) {
            this.pointsArray.push(point);
        }
    }, {
        key: "popPoint",
        value: function popPoint() {
            this.pointsArray.pop();
        }
    }, {
        key: "pointsNumber",
        get: function get() {
            return this.pointsArray.length;
        }
    }], [{
        key: "TYPE_RECTANGLE",
        get: function get() {
            return TYPE_RECTANGLE;
        }
    }, {
        key: "TYPE_POLYGON",
        get: function get() {
            return TYPE_POLYGON;
        }
    }, {
        key: "TYPE_TRIANGLE",
        get: function get() {
            return TYPE_TRIANGLE;
        }
    }, {
        key: "TYPE_ELLIPSE",
        get: function get() {
            return TYPE_ELLIPSE;
        }
    }]);

    return SubPath3D;
}();

exports.default = SubPath3D;