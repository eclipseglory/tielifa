import AbstractFigure from "./AbstractFigure.js";

export default class Figure3D extends AbstractFigure {
    constructor(p) {
        p = p || {};
        super(p);
    }

    getTransformSpaceLeft() {
        return this.x - this.width / 2;
    }

    getTransformSpaceTop() {
        return this.y - this.height / 2;
    }

    getTransformSpaceFar() {
        return this.z - this.depth / 2;
    }

    _getTransformFinalX() {
        return this.width / 2;
    }

    _getTransformFinalY() {
        return this.height / 2;
    }

    _getTransformFinalZ() {
        return this.depth / 2;
    }
}