const TYPE_RECTANGLE = 0;
const TYPE_TRIANGLE = 1;
const TYPE_POLYGON = 2;
const TYPE_ELLIPSE = 3;
export default class SubPath3D {
    constructor(startPoint, type) {
        this.pointsArray = [];
        if (startPoint != undefined && startPoint != null) {
            this.pushPoint(startPoint);
        }
        this.isClosed = false;
        this.type = type || TYPE_POLYGON;
    }

    static get TYPE_RECTANGLE() {
        return TYPE_RECTANGLE;
    }

    static get TYPE_POLYGON() {
        return TYPE_POLYGON;
    }

    static get TYPE_TRIANGLE() {
        return TYPE_TRIANGLE;
    }

    static get TYPE_ELLIPSE() {
        return TYPE_ELLIPSE;
    }

    close() {
        this.isClosed = true;
    }

    getPoint(index) {
        return this.pointsArray[index];
    }


    clean() {
        this.pointsArray.length = 0;
        this.isClosed = false;
        // this.pointsArray = [];// 这样比length = 0 效率高???!!
    }

    pushPoint(point) {
        this.pointsArray.push(point);
    }

    popPoint() {
        this.pointsArray.pop();
    }

    get pointsNumber() {
        return this.pointsArray.length;
    }
}