import Tools from "../utils/Tools.js";
import Mat4 from "../math/Mat4.js";
import Vector3 from "../math/Vector3.js";
import VDO from "../webgl/VDO.js";
import List from "../common/List.js";

const EVENT_ADD_CHILD = "event_add_child";
const EVENT_REMOVE_CHILD = "event_remove_child";
const EVENT_BEFORE_DRAW_ME = "event_before_draw_me";
const EVENT_AFTER_DRAW_ME = "event_after_draw_me";
const EVENT_BEFORE_DRAW = "event_before_draw";
const EVENT_AFTER_DRAW = "event_after_draw";

const FIX_VDO_TIMING = 1000;

let _drawSelfNum = Symbol('绘制自身次数');
export default class AbstractFigure {
    get opacity() {
        return this._opacity;
    }

    set opacity(value) {
        if (this._opacity === value) return;
        this._opacity = value;
    }

    static get EVENT_ADD_CHILD() {
        return EVENT_ADD_CHILD;
    }

    static get EVENT_REMOVE_CHILD() {
        return EVENT_REMOVE_CHILD;
    }

    static get EVENT_BEFORE_DRAW() {
        return EVENT_BEFORE_DRAW;
    }

    static get EVENT_AFTER_DRAW() {
        return EVENT_AFTER_DRAW;
    }

    static get EVENT_BEFORE_DRAW_SELF() {
        return this.EVENT_BEFORE_DRAW_ME;
    }

    static get EVENT_AFTER_DRAW_SELF() {
        return this.EVENT_AFTER_DRAW_ME;
    }

    static get EVENT_BEFORE_DRAW_ME() {
        return EVENT_BEFORE_DRAW_ME;
    }

    static get EVENT_AFTER_DRAW_ME() {
        return EVENT_AFTER_DRAW_ME;
    }

    get x() {
        return this._x;
    }

    set x(value) {
        if (this._x === value) return;
        this._x = value;
        this.transformDirty = true;
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

    constructor(p) {
        p = p || {};
        this._x = p['x'] || 0;
        this._y = p['y'] || 0;
        this._z = p['z'] || 0;

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
    }

    fireDirty() {
        this._contentDirty = true;
    }

    save() {
        this._contentDirty = false;
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
        let listeners = this.listenersMap[name];
        if (listeners == null) return;
        for (let i = 0; i < listeners.length; i++) {
            let listener = listeners[i];
            listener(event);
        }
    }

    addEventListener(name, listener) {
        let listeners = this.listenersMap[name];
        if (listeners == null) {
            listeners = [];
            this.listenersMap[name] = listeners;
        }
        listeners.push(listener);
    }

    removeEventListener(name, listener) {
        let listeners = this.listenersMap[name];
        if (listeners != null) {
            Tools.removeObjFromArray(listener, listeners);
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
            this.fireEvent(EVENT_ADD_CHILD, {"source": this, "child": child, "oldParent": oldParent});
        }
    }

    removeChild(child) {
        if (child.parent == this) {
            if (this.children.remove(child)) {
                this.parent = null;
                this.fireEvent(EVENT_REMOVE_CHILD, {"source": this, "child": child, "oldParent": this});
            }
        }
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
    }

    _opacityChangedWithoutRedraw(opacity, oldOpacity) {
        this._changeVDOOpacity(this.graphics.vdo, opacity);
        if (opacity >= 1 && oldOpacity < 1) {
            this.graphics.vdo.indexData.copyFrom(this.graphics.vdo.opacityIndexData);
            this.graphics.vdo.opacityIndexData.init();
        }
        if (opacity < 1 && oldOpacity >= 1) {
            this.graphics.vdo.opacityIndexData.copyFrom(this.graphics.vdo.indexData);
            this.graphics.vdo.indexData.init();
        }
    }

    draw(ctx) {
        let event = {source: this};
        this.fireEvent(EVENT_BEFORE_DRAW, event);
        this.beforeDraw(ctx);
        if (!this.visible) return;
        ctx.save();
        ctx.applyTransformMatrix(this.getTransformMatrix());
        this.fireEvent(EVENT_BEFORE_DRAW_ME, event);
        this.beforeDrawSelf(ctx);
        if (this._opacity !== 0) {
            if (this.realTimeDraw) {
                this.applyDrawingStyle(ctx);
                this.drawSelf(ctx);
            } else {
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
                    ctx.applyTransformForVDO(this._lastMatrix, this._rawVDO, this.graphics.vdo);
                }
                if (!redraw && this.opacity != this._lastOpacity) {
                    this._opacityChangedWithoutRedraw(this.opacity, this._lastOpacity);
                }
                this._lastOpacity = this.opacity;
                this.beforeDrawGraphics(redraw);
                ctx.drawGraphics(this.graphics, false);
                this.afterDrawGraphics(redraw);
                this[_drawSelfNum]++;
                if (this[_drawSelfNum] >= FIX_VDO_TIMING) {
                    if (this.graphics != null) this.graphics.vdo.fixLength();
                    if (this._rawVDO != null) this._rawVDO.fixLength();
                    this[_drawSelfNum] = 0;
                }
            }
        }
        this.afterDrawSelf(ctx);
        this.fireEvent(EVENT_AFTER_DRAW_ME, event);
        this.beforeDrawChildren(ctx);
        this.drawChildren(ctx);
        this.afterDrawChildren(ctx);
        ctx.restore();
        this.afterDraw(ctx);
        this.fireEvent(EVENT_AFTER_DRAW, event);
    }

    update(ctx) {
        this.draw(ctx);
    }

    beforeDrawGraphics(redrawed) {

    }

    afterDrawGraphics(redrawed) {

    }

    _changeVDOOpacity(vdo, opacity) {
        for (let i = 0; i < vdo.currentIndex; i++) {
            vdo.fragmentData.setFragmentOpacity(opacity, i);
        }
    }

    afterDrawSelf(ctx) {

    }

    afterDrawChildren(ctx) {

    }

    afterDraw(ctx) {

    }

    beforeDrawSelf(ctx) {

    }

    beforeDrawChildren(ctx) {

    }

    beforeDraw(ctx) {

    }

    _copyToRawVDO(vdo) {
        if (this._rawVDO == null) {
            this._rawVDO = new VDO(vdo.verticesData.currentIndex, vdo.indexData.currentIndex);
        }
        this._rawVDO.verticesData.copyFrom(vdo.verticesData);
        this._rawVDO.fragmentData.copyFrom(vdo.fragmentData);
        this._rawVDO.indexData.copyFrom(vdo.indexData);

        // this._rawVDO.opacityVerticesData.copyFrom(vdo.opacityVerticesData);
        // this._rawVDO.opacityFragmentData.copyFrom(vdo.opacityFragmentData);
        this._rawVDO.opacityIndexData.copyFrom(vdo.opacityIndexData);
    }

    drawSelf(ctx) {

    }

    drawChildren(ctx) {
        for (let i = 0; i < this.children.length; i++) {
            let child = this._children.get(i);
            child.draw(ctx);
        }
    }

}