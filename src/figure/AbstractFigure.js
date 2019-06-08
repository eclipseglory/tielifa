import Tools from "../utils/Tools.js";
import Mat4 from "../math/Mat4.js";
import Vector3 from "../math/Vector3.js";
import VDO from "../webgl/VDO.js";
import List from "../common/List.js";
import Color from "../utils/Color.js";

const EVENT_ADD_CHILD = "event_add_child";
const EVENT_REMOVE_CHILD = "event_remove_child";

const EVENT_BEFORE_PREPARE_ME = "event_before_PREPARE_me";
const EVENT_AFTER_PREPARE_ME = "event_after_PREPARE_me";
const EVENT_BEFORE_PREPARE = "event_before_PREPARE";
const EVENT_AFTER_PREPARE = "event_after_PREPARE";
const EVENT_AFTER_PREPARE_CHILDREN = "event_after_PREPARE_children";
const EVENT_BEFORE_PREPARE_CHILDREN = "event_before_PREPARE_children";


const FIX_VDO_TIMING = 1000;

let CONSTID = 0;

let _drawSelfNum = Symbol('绘制自身次数');
export default class AbstractFigure {
    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;
    }

    get opacity() {
        return this._opacity;
    }

    set opacity(value) {
        if (this._opacity === value) return;
        this._opacity = value;
    }

    static get EVENT_BEFORE_PREPARE_SELF() {
        return EVENT_BEFORE_PREPARE_ME;
    }

    static get EVENT_AFTER_PREPARE_SELF() {
        return EVENT_AFTER_PREPARE_ME;
    }

    static get EVENT_BEFORE_PREPARE() {
        return EVENT_BEFORE_PREPARE;
    }

    static get EVENT_AFTER_PREPARE() {
        return EVENT_AFTER_PREPARE;
    }

    static get EVENT_BEFORE_PREPARE_CHILDREN() {
        return EVENT_BEFORE_PREPARE_CHILDREN;
    }

    static get EVENT_AFTER_PREPARE_CHILDREN() {
        return EVENT_AFTER_PREPARE_CHILDREN;
    }


    static get EVENT_ADD_CHILD() {
        return EVENT_ADD_CHILD;
    }

    static get EVENT_REMOVE_CHILD() {
        return EVENT_REMOVE_CHILD;
    }


    get x() {
        return this._x;
    }

    set x(value) {
        if (this._x === value) return;
        this._x = value;
        this.transformDirty = true;
    }

    get left() {
        return this.x;
    }

    get top() {
        return this.y;
    }

    get right() {
        return this.x + this.width;
    }

    get bottom() {
        return this.y + this.height;
    }

    get y() {
        return this._y;
    }

    set y(value) {
        if (this._y === value) return;
        this._y = value;
        this.transformDirty = true;
    }

    get z() {
        return this._z;
    }

    set z(value) {
        if (this._z === value) return;
        this._z = value;
        this.transformDirty = true;
    }

    get rotateZ() {
        return this._rotateZ;
    }

    set rotateZ(value) {
        if (Math.abs(value) >= 360) value = value % 360;
        if (this._rotateZ === value) return;
        this._rotateZ = value;
        this.transformDirty = true;
    }

    get rotateX() {
        return this._rotateX;
    }

    set rotateX(value) {
        if (Math.abs(value) >= 360) value = value % 360;
        if (this._rotateX === value) return;
        this._rotateX = value;
        this.transformDirty = true;
    }

    get rotateY() {
        return this._rotateY;
    }

    set rotateY(value) {
        if (Math.abs(value) >= 360) value = value % 360;
        if (this._rotateY === value) return;
        this._rotateY = value;
        this.transformDirty = true;
    }

    get scaleX() {
        return this._scaleX;
    }

    set scaleX(value) {
        if (this._scaleX === value) return;
        this._scaleX = value;
        this.transformDirty = true;
    }

    get scaleY() {
        return this._scaleY;
    }

    set scaleY(value) {
        if (this._scaleY === value) return;
        this._scaleY = value;
        this.transformDirty = true;
    }

    get scaleZ() {
        return this._scaleZ;
    }

    set scaleZ(value) {
        if (this._scaleZ === value) return;
        this._scaleZ = value;
        this.transformDirty = true;
    }

    get width() {
        return this._width;
    }

    set width(value) {
        if (this._width === value) return;
        this._width = value;
        this.fireDirty();
    }

    get height() {
        return this._height;
    }

    set height(value) {
        if (this._height === value) return;
        this._height = value;
        this.fireDirty();
    }

    get depth() {
        return this._depth;
    }

    set depth(value) {
        if (this._depth === value) return;
        this._depth = value;
        this.fireDirty();
    }

    get anchorX() {
        if (this._anchorX == null) {
            this._anchorX = 0.5;
        }
        return this._anchorX;
    }

    set anchorX(value) {
        if (value < 0 || value > 1) return;
        if (this._anchorX === value) return;
        this._anchorX = value;
        this.transformDirty = true;
    }

    get anchorY() {
        if (this._anchorY == null) {
            this._anchorY = 0.5;
        }
        return this._anchorY;
    }

    set anchorY(value) {
        if (value < 0 || value > 1) return;
        if (this._anchorY === value) return;
        this._anchorY = value;
        this.transformDirty = true;
    }

    get anchorZ() {
        if (this._anchorZ == null) {
            this._anchorZ = 0.5;
        }
        return this._anchorZ;
    }

    set anchorZ(value) {
        if (value < 0 || value > 1) return;
        if (this._anchorZ === value) return;
        this._anchorZ = value;
        this.transformDirty = true;
    }

    get id() {
        return this._id;
    }

    constructor(p) {
        p = p || {};
        this._x = p['x'] || 0;
        this._y = p['y'] || 0;
        this._z = p['z'] || 0;
        this._id = CONSTID++;
        this.reversePaint = p['reversePaint'];
        if (this.reversePaint == null) this.reversePaint = false;

        this._rotateZ = p['rotateZ'] || 0;
        this._rotateX = p['rotateX'] || 0;
        this._rotateY = p['rotateY'] || 0;

        this._anchorX = p['anchorX'];
        this._anchorY = p['anchorY'];
        this._anchorZ = p['anchorZ'];

        this._scaleX = p['scaleX'] || 1;
        this._scaleY = p['scaleY'] || 1;
        this._scaleZ = p['scaleZ'] || 1;

        this._width = p['width'] || 0;
        this._height = p['height'] || 0;
        this._depth = p['depth'] || 0;

        this.visible = p['visible'] || true;
        this._opacity = p['opacity'];
        if (this._opacity == null) this._opacity = 1;
        this._lastOpacity = this._opacity;
        this.verticesNum = p['verticesNum'];
        this._color = p['color'] || '#FFFFFF';
        this._lastColor = this._color;

        this.uvArray = p['uvs'];
        this._lastUVArray = this.uvArray;

        this._listenersMap = null;

        this._children = null;
        this.parent = null;

        this.transformDirty = true;
        this._contentDirty = true;

        this.transformMatrix = Mat4.identity();
        this._lastMatrix = Mat4.identity();
        this._tempMatrix = Mat4.identity();
        this._normalTransformMatrix = Mat4.identity();
        this._tempVertices = new Vector3();
        this._rawVDO = null;
        this.graphics = null;
        this.realTimeDraw = p['realTimeDraw'];
        if (this.realTimeDraw == null) this.realTimeDraw = false;
        this._lastFragmentData = null;
        this[_drawSelfNum] = 0;
        this.relatedRegions = [];
        this._bounds = {left: 0, top: 0, right: 0, bottom: 0};
        this._relativeMatrix = Mat4.identity();
        this._tempP1 = new Float32Array(4);
        this._tempP2 = new Float32Array(4);
        this._tempP3 = new Float32Array(4);
        this._tempP4 = new Float32Array(4);
        this._childrenDirty = false;
        this._listenerDirty = false;
    }

    fireDirty() {
        this._contentDirty = true;
    }

    save() {
        this._contentDirty = false;
    }

    fireListenerDirty() {
        this._listenerDirty = true;
    }

    saveListenerDirty() {
        this._listenerDirty = false;
    }

    fireChildrenDirty() {
        this._childrenDirty = true;
    }

    saveChildrenDirty() {
        this._childrenDirty = false;
    }

    get children() {
        if (this._children == null) {
            this._children = new List();
        }
        return this._children;
    }

    get listenersMap() {
        if (this._listenersMap == null) {
            this._listenersMap = {};
        }
        return this._listenersMap;
    }

    get center() {
        return {x: this._x, y: this._y, z: this._z};
    }

    fireEvent(name, event) {
        this.saveListenerDirty();
        let listeners = this.listenersMap[name];
        if (listeners == null) return;
        for (let i = 0; i < listeners.length;) {
            let listener = listeners[i];
            listener(event);
            if (this._listenerDirty) {
                let index = listeners.indexOf(listener);
                if (index >= 0) {
                    i = index;
                    i++;
                }
                this.saveListenerDirty();
            } else {
                i++;
            }
        }
    }

    addEventListener(name, listener) {
        let listeners = this.listenersMap[name];
        if (listeners == null) {
            listeners = [];
            this.listenersMap[name] = listeners;
        }
        listeners.push(listener);
        this.fireListenerDirty();
    }

    removeEventListener(name, listener) {
        let listeners = this.listenersMap[name];
        if (listeners != null) {
            Tools.removeObjFromArray(listener, listeners);
            this.fireListenerDirty();
        }
    }

    hasChild(child) {
        return this.indexChild(child) != -1;
    }

    indexChild(child) {
        return this.children.indexOf(child);
    }

    addChild(child) {
        if (!this.hasChild(child)) {
            let oldParent = child.parent;
            if (oldParent != null) {
                if (oldParent != this) {
                    oldParent.removeChild(child);
                }
            }
            this.children.add(child);
            child.parent = this;
            this.fireChildrenDirty();
            this.fireEvent(EVENT_ADD_CHILD, {"source": this, "child": child, "oldParent": oldParent});
        }
    }

    removeChild(child) {
        if (child.parent == this) {
            if (this.children.remove(child)) {
                child.parent = null;
                this.fireChildrenDirty();
                this.fireEvent(EVENT_REMOVE_CHILD, {"source": this, "child": child, "oldParent": this});
            }
        }
    }

    insertChild(child, index) {
        if (index >= this.children.length) return;
        if (child.parent == this) {
            if (this.indexChild(child) == index) return;
        }
        let oldparent = child.parent;
        if (oldparent != null) {
            oldparent.removeChild(child);
        }
        this.children.insert(child, index);
        child.parent = this;
        this.fireChildrenDirty();
        this.fireEvent(EVENT_ADD_CHILD, {"source": this, "child": child, "oldParent": oldparent});
    }


    getChild(index) {
        return this._children.get(index);
    }

    containsChild(child) {
        return this._children.contains(child);
    }

    getTransformSpaceLeft() {
        return this.x;
    }

    getTransformSpaceTop() {
        return this.y;
    }

    getTransformSpaceFar() {
        return this.z;
    }

    _getAnchorX() {
        return (this.anchorX) * this.width;
    }

    _getAnchorY() {
        return (this.anchorY) * this.height;
    }

    _getAnchorZ() {
        return (this.anchorZ) * this.depth;
    }

    _getTransformFinalX() {
        return 0;
    }

    _getTransformFinalY() {
        return 0;
    }

    _getTransformFinalZ() {
        return 0;
    }

    getRelativeTransformMatrix(parent) {
        let myMatrix = this.getTransformMatrix();
        if (parent == this) {
            Mat4.copy(myMatrix, this._relativeMatrix);
            return this._relativeMatrix;
        }
        let m = this._relativeMatrix;
        if (this.parent != null) {
            Mat4.copy(this.parent.getRelativeTransformMatrix(parent), m);
        }
        Mat4.multiply(m, m, myMatrix);
        return m;
    }

    getRelativeBounds(parent, out) {
        if (out == null) out = this._bounds;
        let matrix = this.getRelativeTransformMatrix(parent);
        let left = 0;
        let right = this.width;
        let top = 0;
        let bottom = this.height;
        this._tempP1[0] = left;
        this._tempP1[1] = top;
        this._tempP1[2] = this.depth;
        this._tempP1[3] = 1;

        this._tempP2[0] = right;
        this._tempP2[1] = top;
        this._tempP2[2] = this.depth;
        this._tempP2[3] = 1;

        this._tempP3[0] = left;
        this._tempP3[1] = bottom;
        this._tempP3[2] = this.depth;
        this._tempP3[3] = 1;

        this._tempP4[0] = right;
        this._tempP4[1] = bottom;
        this._tempP4[2] = this.depth;
        this._tempP4[3] = 1;

        let p1 = Mat4.multiplyWithVertex(matrix, this._tempP1, this._tempP1);
        let p2 = Mat4.multiplyWithVertex(matrix, this._tempP2, this._tempP2);
        let p3 = Mat4.multiplyWithVertex(matrix, this._tempP3, this._tempP3);
        let p4 = Mat4.multiplyWithVertex(matrix, this._tempP4, this._tempP4);

        let lp = p1;
        if (p2[0] < lp[0]) lp = p2;
        if (p3[0] < lp[0]) lp = p3;
        if (p4[0] < lp[0]) lp = p4;

        let tp = p1;
        if (p2[1] < tp[1]) tp = p2;
        if (p3[1] < tp[1]) tp = p3;
        if (p4[1] < tp[1]) tp = p4;

        let rp = p1;
        if (p2[0] > rp[0]) rp = p2;
        if (p3[0] > rp[0]) rp = p3;
        if (p4[0] > rp[0]) rp = p4;

        let bp = p1;
        if (p2[1] > bp[1]) bp = p2;
        if (p3[1] > bp[1]) bp = p3;
        if (p4[1] > bp[1]) bp = p4;
        out.left = lp[0];
        out.top = tp[1];
        out.right = rp[0];
        out.bottom = bp[1];
        // this._bounds.width = rp[0] - lp[0];
        // this._bounds.height = bp[1] - tp[1];
        return out;
    }

    getTransformMatrix() {
        if (this.transformDirty) { // 如果发生过transform的属性改变，就要重新计算一次
            Mat4.identityMatrix(this.transformMatrix);
            let currentMatrix = this.transformMatrix;
            let m = this._tempMatrix; // 这是要相乘的临时变化矩阵
            Mat4.identityMatrix(m);
            let x = this.getTransformSpaceLeft();
            let y = this.getTransformSpaceTop();
            let z = this.getTransformSpaceFar();
            let transformX = this._getAnchorX();
            let transformY = this._getAnchorY();
            let transformZ = this._getAnchorZ();
            let scaleX = this._scaleX;
            let scaleY = this._scaleY;
            let scaleZ = this._scaleZ;
            let rotateZ = this._rotateZ;
            let rotateX = this._rotateX;
            let rotateY = this._rotateY;
            if (!(Tools.equals(x, 0) && Tools.equals(y, 0) && Tools.equals(z, 0))) {
                Mat4.translationMatrix(m, x, y, z);
                Mat4.multiply(currentMatrix, currentMatrix, m);
            }

            let flag = false;
            if (!(Tools.equals(transformX, 0) && Tools.equals(transformY, 0) && Tools.equals(transformZ, 0))) {
                flag = true;
            }
            if (flag) {
                Mat4.translationMatrix(m, transformX, transformY, transformZ);
                Mat4.multiply(currentMatrix, currentMatrix, m);
            }
            if (!Tools.equals(rotateZ, 0)) {
                Mat4.rotationZMatrix(m, rotateZ * Tools.PIDIV180);
                Mat4.multiply(currentMatrix, currentMatrix, m);
            }
            if (!Tools.equals(rotateX, 0)) {
                Mat4.rotationXMatrix(m, rotateX * Tools.PIDIV180);
                Mat4.multiply(currentMatrix, currentMatrix, m);
            }
            if (!Tools.equals(rotateY, 0)) {
                Mat4.rotationYMatrix(m, rotateY * Tools.PIDIV180);
                Mat4.multiply(currentMatrix, currentMatrix, m);
            }

            if (flag) {
                Mat4.translationMatrix(m, -transformX, -transformY, -transformZ);
                Mat4.multiply(currentMatrix, currentMatrix, m);
            }
            if (!(Tools.equals(scaleX, 1) && Tools.equals(scaleY, 1) && Tools.equals(scaleZ, 1))) {
                Mat4.scalingMatrix(m, scaleX, scaleY, scaleZ);
                Mat4.multiply(currentMatrix, currentMatrix, m);
            }
            let newx = transformX / scaleX - transformX;
            let newy = transformY / scaleY - transformY;
            let newz = transformZ / scaleZ - transformZ;
            if (!(Tools.equals(newx, 0) && Tools.equals(newy, 0) && Tools.equals(newz, 0))) {
                Mat4.translationMatrix(m, newx, newy, newz);
                Mat4.multiply(currentMatrix, currentMatrix, m);
            }
            let fx = this._getTransformFinalX();
            let fy = this._getTransformFinalY();
            let fz = this._getTransformFinalZ();
            if (!(Tools.equals(fx, 0) && Tools.equals(fy, 0) && Tools.equals(fz, 0))) {
                Mat4.translationMatrix(m, fx, fy, fz);
                Mat4.multiply(currentMatrix, currentMatrix, m);
            }
            this.transformDirty = false;
        }
        return this.transformMatrix;
    }

    destroy() {
        this._children = null;
        this.parent = null;

        this.transformMatrix = null;
        this._lastMatrix = null;
        this._tempMatrix = null;
        this._normalTransformMatrix = null;
        this._tempVertices = null;
        this._rawVDO = null;
        this.graphics = null;
    }

    applyDrawingStyle(ctx) {
        ctx.globalAlpha = this._opacity;
        ctx.fillStyle = this.color;
    }

    updateOpacityVDO(opacity, oldOpacity) {
        this._changeVDOOpacity(this.graphics.vdo, opacity);
        if (!this.graphics.vdo.lockSwitch) {
            if (opacity >= 1 && oldOpacity < 1) {
                this.graphics.vdo.indexData.copyFrom(this.graphics.vdo.opacityIndexData);
                this.graphics.vdo.opacityIndexData.init();
            }
            if (opacity < 1 && oldOpacity >= 1) {
                this.graphics.vdo.opacityIndexData.copyFrom(this.graphics.vdo.indexData);
                this.graphics.vdo.indexData.init();
            }
        }
    }

    updateColorVDO(color, oldColor, vdo, rawVDO) {
        let rgb = Color.getInstance().convertStringToColor(color);
        for (let i = 0; i < vdo.currentIndex; i++) {
            vdo.fragmentData.setFragmentColor(rgb[0], rgb[1], rgb[2], i);
        }
    }

    updateVertexVDO(ctx, currentTransformMatrix) {
        ctx.applyTransformForVDO(currentTransformMatrix, this._rawVDO, this.graphics.vdo);
    }

    updateUVVDO(uvs, oldUVs, vdo, rawVDO) {
        if (uvs == null) {
            for (let i = 0; i < vdo.currentIndex; i++) {
                vdo.fragmentData.setFragmenUV(0, 0, i);
            }
        } else {
            for (let i = 0; i < vdo.currentIndex; i++) {
                let uv = uvs[i];
                if (uv == null) uv = [0, 0];
                vdo.fragmentData.setFragmenUV(uv[0], uv[1], i);
            }
        }
    }

    updateFragmentVDO(ctx) {
        if (this.opacity !== this._lastOpacity) {
            this.updateOpacityVDO(this.opacity, this._lastOpacity);
        }
        if (this.color !== this._lastColor) {
            this.updateColorVDO(this.color, this._lastColor, this.graphics.vdo, this._rawVDO);
        }
        if (this.uvArray != this._lastUVArray) {
            this.updateUVVDO(this.uvArray, this._lastUVArray, this.graphics.vdo, this._rawVDO);
        }
    }


    refreshDirty(ctx) {
        // TODO 这个地方可以用逆矩阵计算，但是总出bug,so不用
        let currentMatrix = ctx.currentContextState.transformMatrix;
        let sameMatrix = Mat4.exactEquals(currentMatrix, this._lastMatrix);
        Mat4.copy(currentMatrix, this._lastMatrix);
        //这里的粒度很粗，不能细化到颜色、透明度、UV等
        let redraw = false;
        if (this._contentDirty) {
            sameMatrix = false;
            this[_drawSelfNum] = 0;
            ctx.startGraphics(this.graphics, this.verticesNum);
            this.applyDrawingStyle(ctx);
            this.drawSelf(ctx);
            this.graphics = ctx.endGraphics();
            // this.graphics.vdo.fixLength();
            //graphics里的数据是最原始的，需要记录
            this._copyToRawVDO(this.graphics.vdo);
            redraw = true;
            this.save();
        }

        if (!sameMatrix) {
            this.updateVertexVDO(ctx, this._lastMatrix);
        }
        if (!redraw) {
            this.updateFragmentVDO(ctx);
        }
        this._lastOpacity = this.opacity;
        this._lastColor = this.color;
        ctx.drawGraphics(this.graphics, false);
        this[_drawSelfNum]++;
        if (this[_drawSelfNum] >= FIX_VDO_TIMING) {
            if (this.graphics != null) this.graphics.vdo.fixLength();
            if (this._rawVDO != null) this._rawVDO.fixLength();
            this[_drawSelfNum] = 0;
        }
    }

    applyTransformMatrix(ctx) {
        ctx.applyTransformMatrix(this.getTransformMatrix());
    }

    draw(ctx) {
        if (!this.visible) return;
        if (this.scaleX == 0 || this.scaleY == 0 || this.scaleZ == 0) return;
        ctx.save();
        this.applyTransformMatrix(ctx);
        if (this.reversePaint) {
            this.drawChildren(ctx);
            if (this.opacity !== 0) {
                if (this.realTimeDraw) {
                    this.applyDrawingStyle(ctx);
                    this.drawSelf(ctx);
                } else {
                    this.refreshDirty(ctx);
                }
            }

        } else {
            if (this.opacity !== 0) {
                if (this.realTimeDraw) {
                    this.applyDrawingStyle(ctx);
                    this.drawSelf(ctx);
                } else {
                    this.refreshDirty(ctx);
                }
            }
            this.drawChildren(ctx);
        }
        ctx.restore();
    }

    update(ctx) {
        this.prepareDraw(ctx);
        this.sortChildren();
        this.draw(ctx);
    }

    sortChildren() {

    }


    _changeVDOOpacity(vdo, opacity) {
        for (let i = 0; i < vdo.currentIndex; i++) {
            vdo.fragmentData.setFragmentOpacity(opacity, i);
        }
    }

    _copyToRawVDO(vdo) {
        if (this._rawVDO == null) {
            this._rawVDO = new VDO(vdo.verticesData.currentIndex, vdo.indexData.currentIndex);
        }
        this._rawVDO.verticesData.copyFrom(vdo.verticesData);
        this._rawVDO.indexData.copyFrom(vdo.indexData);
        this._rawVDO.opacityIndexData.copyFrom(vdo.opacityIndexData);
    }

    drawSelf(ctx) {

    }

    prepareSelf(ctx) {

    }

    beforePrepareSelf(ctx) {

    }

    afterPrepareSelf(ctx) {
    }

    beforePrepareDraw(ctx) {
    }

    afterPrepareDraw(ctx) {
    }

    prepareDraw(ctx) {
        let oldParent = this.parent;
        let event = {source: this};
        this.fireEvent(EVENT_BEFORE_PREPARE, event);
        this.beforePrepareDraw(ctx);

        this.fireEvent(EVENT_BEFORE_PREPARE_ME, event);
        this.beforePrepareSelf(ctx);
        this.prepareSelf(ctx);
        this.afterPrepareSelf(ctx);
        this.fireEvent(EVENT_AFTER_PREPARE_ME, event);

        if (oldParent != this.parent && this.parent == null) {
            //说明在准备阶段被移除了，那就不再做处理
            return;
        }

        this.fireEvent(EVENT_BEFORE_PREPARE_CHILDREN, event);
        this.beforePrepareChildren(ctx);
        this.prepareChildren(ctx);
        this.afterPrepareChildren(ctx);
        this.fireEvent(EVENT_AFTER_PREPARE_CHILDREN, event);

        this.afterPrepareDraw(ctx);
        this.fireEvent(EVENT_AFTER_PREPARE, event);
    }

    beforePrepareChildren(ctx) {

    }

    afterPrepareChildren(ctx) {

    }

    prepareChild(child, ctx) {
        child.prepareDraw(ctx);
    }

    prepareChildren(ctx) {
        this.saveChildrenDirty();
        for (let i = 0; i < this.children.length;) {
            let child = this.children.get(i);
            this.prepareChild(child, ctx);
            if (this._childrenDirty) {
                let index = this.children.indexOf(child);
                if (index >= 0) {
                    i = index;
                    i++;
                }
                this.saveChildrenDirty();
            } else {
                i++;
            }
        }
    }

    drawChild(child, ctx) {
        child.draw(ctx);
    }


    drawChildren(ctx) {
        this.saveChildrenDirty();
        for (let i = 0; i < this.children.length;) {
            let child = this.children.get(i);
            this.drawChild(child, ctx);
            if (this._childrenDirty) {
                let index = this.children.indexOf(child);
                if (index >= 0) {
                    i = index;
                    i++;
                }
                this.saveChildrenDirty();
            } else {
                i++;
            }
        }
    }
}