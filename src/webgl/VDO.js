import VerticesData from "./VerticesData.js";
import IndexData from "./IndexData.js";
import FragmentData from "./FragmentData.js";
import TransformMatrixData from "./TransformMatrixData.js";

export default class VDO {
    constructor(maxVerticesNumber, indexNumber, lockSwitch) {
        if (indexNumber == null) indexNumber = maxVerticesNumber;
        this.verticesData = new VerticesData(maxVerticesNumber);
        this.indexData = new IndexData(indexNumber);
        this.fragmentData = new FragmentData(maxVerticesNumber);
        this.transformMatrixData = new TransformMatrixData(maxVerticesNumber);

        this.opacityIndexData = new IndexData(indexNumber);
        this.useOpacityBuffer = false;
        this.lockSwitch = lockSwitch;
        if (this.lockSwitch == null) this.lockSwitch = false;
    }

    get currentIndexData() {
        if (this.useOpacityBuffer) {
            return this.opacityIndexData;
        } else {
            return this.indexData;
        }
    }

    get currentVerticesData() {
        return this.verticesData;
    }

    get currentFragmentData() {
        return this.fragmentData;
    }


    get currentIndex() {
        return this.verticesData.currentIndex;
    }

    get originalCurrentIndex() {
        return this.verticesData.currentIndex;
    }

    switch(useOpacityBuffer) {
        if (this.lockSwitch) return;
        this.useOpacityBuffer = useOpacityBuffer;
    }

    init() {
        this.verticesData.init();
        this.fragmentData.init();
        this.transformMatrixData.init();
        this.indexData.init();
        this.opacityIndexData.init();
    }

    _addVerticesFragmentData(x, y, z, nx, ny, nz, r, g, b, a, u, v, ti, ft) {
        let vd = this.currentVerticesData;
        let fd = this.currentFragmentData;
        let index = vd.currentIndex;
        vd.addVerticesData(x, y, z, nx, ny, nz);
        fd.addFragmentData(r, g, b, a, u, v, ti, ft);
        return index;
    }


    addIndex(index) {
        let indexData = this.indexData;
        if (this.useOpacityBuffer) {
            indexData = this.opacityIndexData;
        }
        indexData.addIndex(index);
    }

    addVerticesData(coords, normal, color, opacity, uv, textureIndex, filterType) {
        return this._addVerticesFragmentData(coords[0], coords[1], coords[2], normal[0], normal[1], normal[2],
            color[0], color[1], color[2], opacity, uv[0], uv[1], textureIndex, filterType);
    }

    addVerticesData2(coords, normal, color, opacity, uv, textureIndex, filterType) {
        return this._addVerticesFragmentData(coords.x, coords.y, coords.z, normal.x, normal.y, normal.z,
            color[0], color[1], color[2], opacity, uv[0], uv[1], textureIndex, filterType);
    }

    addVerticesData3(x, y, z, normal, color, opacity, uv, textureIndex, filterType) {
        return this._addVerticesFragmentData(x, y, z, normal[0], normal[1], normal[2],
            color[0], color[1], color[2], opacity, uv[0], uv[1], textureIndex, filterType);
    }

    addVerticesData4(x, y, z, nx, ny, nz, color, opacity, uv, textureIndex, filterType) {
        return this._addVerticesFragmentData(x, y, z, nx, ny, nz,
            color[0], color[1], color[2], opacity, uv[0], uv[1], textureIndex, filterType);
    }

    setVerticesCoor(coords, index) {
        let vd = this.currentVerticesData;
        vd.setVerticesCoor(coords[0], coords[1], coords[2], index);
    }

    setVerticesCoor2(coords, index) {
        let vd = this.currentVerticesData;
        vd.setVerticesCoor(coords.x, coords.y, coords.z, index);
    }

    setVerticesCoor3(x, y, z, index) {
        let vd = this.currentVerticesData;
        vd.setVerticesCoor(x, y, z, index);
    }

    fixLength() {
        this.verticesData.fixLength();
        this.fragmentData.fixLength();
        this.indexData.fixLength();

        this.opacityIndexData.fixLength();
    }
}