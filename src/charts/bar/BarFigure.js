import Text from "../../figure/Text.js";
import Cube from "../../figure/Cube.js";
import Figure3D from "../../figure/Figure3D.js";

export default class BarFigure extends Figure3D {
    constructor(p) {
        p = p || {};
        super(p);
        this.text = new Text();
        this.cube = new Cube();
        this.text.fontSize = 16;
        this.text.color = 'black';
        this.text.textAlign = 'center';
        this.addChild(this.text);
        this.addChild(this.cube);
        this.zIndex = -1;
        this.key = null;
        this.realIndex = -1;
    }

    // setData(data, index, zIndex) {
    //     this.data = data;
    //     this.index = index;
    //     this.zIndex = zIndex;
    // }

    get width() {
        return super.width;
    }

    set width(width) {
        super.width = width;
        this.text.maxWidth = width;
    }

    setFontSize(size) {
        this.text.fontSize = size;
    }

    setFontFamily(family) {
        this.text.fontFamily = family;
    }

    setFontStyle(style) {
        this.text.fontStyle = style;
    }

    setFontWeight(weight) {
        this.text.fontWeight = weight;
    }

    getText(data) {
        if (this.parent != null && this.parent.textLoader != null) {
            return this.parent.textLoader(data, this.index);
        }
        return data.toString();
    }

    drawSelf(ctx) {
        //此为一个哑元，不需要绘制自己
    }

    refreshDirty(ctx) {
        //此为一个哑元，不需要绘制自己
    }

    prepareSelf(ctx) {
        super.prepareSelf(ctx);

        let data = this.parent.getBarData(this.key, this.zIndex);
        let index = this.parent.getBarIndex(this.key);
        // if (this.realIndex <= this.parent.negativeColumn) {
        //     this.visible = true;
        // } else {
        //     this.visible = false;
        // }

        let originalCoord = this.parent.getOriginalCoord();
        let x = originalCoord.x;
        let y = originalCoord.y;
        let z = originalCoord.z;

        let parent = this.parent;
        if (parent == null) return;
        let columnWidth = parent.getColumnWidth();
        let barWidth = columnWidth * parent.widthRate;
        let spaceWidth = (columnWidth - barWidth) / 2;
        let preHeight = parent.getPerHeight();
        let height = (data - parent.originalValue) * preHeight;
        this.width = barWidth;
        this.height = parent.height;
        this.depth = parent.depth;

        this.cube.width = this.width;
        this.cube.height = this.height;
        this.cube.depth = this.depth;
        this.cube.scaleZ = parent.depthRate;
        let rate = Math.abs(height) / this.height;
        this.cube.scaleY = rate;

        this.z = z + parent.depth / 2;
        this.x = x + barWidth / 2 + spaceWidth + index * columnWidth;
        this.y = y - height / 2;


        this.text.text = this.getText(data);
        this.text.z = 0;
        this.text.x = 0;
        this.text.y = -this.height * rate / 2 - this.text.height / 2;
        if (height < 0) {
            this.text.y *= -1;
        }
    }
}