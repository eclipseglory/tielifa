import AbstractFigure from "./AbstractFigure.js";

const LINEAR = 'linear';
const EASE = "ease";
const EASE_IN = 'ease_in';
const EASE_IN_OUT = 'ease_in_out';
const EASE_OUT = 'ease_out';
const COMPLETE = 'complete';
const INTERRUPT = 'interrupt';
const PRE_FRAME_REFRESH_NUM = 60 / 1000;
export default class FigureAnimation {
    get totalCount() {
        return Math.floor(this.totalTime * PRE_FRAME_REFRESH_NUM);
    }

    constructor(figure, p) {
        p = p || {};
        if (figure == null) throw new Error('Figure should not be null');
        this.timingFunction = p['type'] || LINEAR;
        this.totalTime = p['time'];
        if (this.totalTime == null) this.totalTime = 500;
        this.loop = p['loop'];
        if (this.loop == null) this.loop = 1;
        this.figure = figure;
        this.callbacks = p['callbacks'];
        this._running = false;
        this._pause = false;
        let that = this;
        this.refreshCount = 0;
        this._loopTime = 0;
        this._loopFunction = function (evt) {
            if (that.paused) return;
            that.repeat();
        };
        this.animationArray = [];
        this.runningAnimationIndex = 0;
    }

    getFigurePropertyValue(figure, name) {
        return figure[name];
    }

    setFigurePropertyValue(figure, name, value) {
        figure[name] = value;
    }


    moveTo(x, y) {
        this.propertyChangeTo(this.figure.left, x, 'left');
        this.propertyChangeTo(this.figure.top, y, 'top');
        return this;
    }

    rotateTo(rotate) {
        return this.propertyChangeTo(this.figure.rotate, rotate, 'rotate');
    }

    scaleTo(sx, sy) {
        this.propertyChangeTo(this.figure.scaleX, sx, 'scaleX');
        this.propertyChangeTo(this.figure.scaleY, sy, 'scaleY');
        return this;
    }

    move(deltaX, deltaY) {
        this.propertyChange(deltaX, 'left');
        this.propertyChange(deltaY, 'top');
        return this;
    }

    rotate(rotate) {
        this.propertyChange(rotate, 'rotate');
        return this;
    }

    scale(scaleX, scaleY) {
        this.propertyChange(scaleX, 'scaleX');
        this.propertyChange(scaleY, 'scaleY');
        return this;
    }

    reset() {
        this.animationArray = [];
        this.runningAnimationIndex = 0;
        this.refreshCount = 0;
        this._running = false;
        this._pause = false;
        this._loopTime = 0;
    }

    get lastAnimation() {
        let last = this.animationArray[this.animationArray.length - 1];
        if (last == null) {
            last = {totalCount: this.totalCount, propertyTable: {}, type: this.timingFunction};
            this.animationArray.push(last);
        }
        return last;
    }

    propertyChange(delta, propertyName) {
        if(delta == 0) return this;
        let animation = this.lastAnimation;
        animation.propertyTable[propertyName] = {delta: delta, start: null, end: null};
        return this;
    }


    propertyChangeTo(originalValue, finalValue, propertyName) {
        let delta = finalValue - originalValue;
        let preIndex = this.animationArray.length - 2;
        let preAnimation = this.animationArray[preIndex];
        if (preAnimation != null) {
            let preDelta = preAnimation.propertyTable[propertyName];
            if (preDelta != null) {
                delta -= preDelta.delta;
            }
        }
        return this.propertyChange(delta, propertyName);
    }

    then(totalTime, type) {
        let totalCount = this.totalCount;
        let t = this.timingFunction;
        if (type != null) t = type;
        if (totalTime != null) {
            totalCount = totalTime * PRE_FRAME_REFRESH_NUM;
        }
        let animation = {totalCount: totalCount, propertyTable: {}, type: t};
        this.animationArray.push(animation);
        return this;
    }

    getDeltaValue(animation, propertyName, refreshCount) {
        if (animation != null) {
            let propertyChange = animation.propertyTable;
            let totalCount = animation.totalCount;
            let property = propertyChange[propertyName];
            if (property != null) {
                if (animation.type === LINEAR) {
                    return property.delta / totalCount;
                }
            }
        }
        return 0;
    }

    resumeProperty() {
        for (let i = 0; i < this.animationArray.length; i++) {
            let animation = this.animationArray[i];
            for (let p in animation.propertyTable) {
                let property = animation.propertyTable[p];
                let v = this.getFigurePropertyValue(this.figure, p);
                this.setFigurePropertyValue(this.figure, p, v - property.delta);
            }
        }
    }

    calculateFinalProperty(animation) {
        for (let p in animation.propertyTable) {
            let property = animation.propertyTable[p];
            let sv = this.getFigurePropertyValue(this.figure, p);
            property.start = sv;
            property.end = property.start + property.delta;
        }
    }

    applyFinalPropertyValue(animation) {
        for (let p in animation.propertyTable) {
            let property = animation.propertyTable[p];
            this.setFigurePropertyValue(this.figure, p, property.end);
        }
    }

    repeat() {
        let refreshCount = this.refreshCount;
        let runningAnimation = this.animationArray[this.runningAnimationIndex];
        if (refreshCount === 0) this.calculateFinalProperty(runningAnimation);
        if (refreshCount >= runningAnimation.totalCount) {
            //当前动画完成,进入下一个动画：
            this.applyFinalPropertyValue(runningAnimation);
            this.runningAnimationIndex++;
            if (this.runningAnimationIndex >= this.animationArray.length) {
                //说明所有动画都已经做完:
                this.runningAnimationIndex = 0;
                this._loopTime++;
                if (this.loop == -1) {
                    //无限循环则
                    this.resumeProperty();
                    this.refreshCount = 0;
                } else {
                    if (this._loopTime >= this.loop) {
                        //所有动画完成，停止：
                        this.stop(COMPLETE);
                    } else {
                        this.resumeProperty();
                        this.refreshCount = 0;
                    }
                }
            } else {
                //动画链没有完结，继续下一个：
                this.refreshCount = 0;
            }

        } else {
            for (let p in runningAnimation.propertyTable) {
                let delta = this.getDeltaValue(runningAnimation, p, refreshCount);
                let v = this.getFigurePropertyValue(this.figure, p);
                this.setFigurePropertyValue(this.figure, p, delta + v);
            }
            this.refreshCount++;
        }
    }

    get isRunning() {
        return this._running;
    }

    pause() {
        if (this.isRunning)
            this._pause = !this._pause;
    }

    get paused() {
        return this._pause;
    }

    interrupt() {
        this.stop(INTERRUPT)
    }

    stop(type) {
        type = type || INTERRUPT;
        this.figure.removeEventListener(AbstractFigure.EVENT_BEFORE_PREPARE_SELF, this._loopFunction);
        this.reset();
        if (this.callbacks != null) {
            if (type == INTERRUPT && this.callbacks.interrupt) {
                this.callbacks.interrupt(this);
            }
            if (type == COMPLETE && this.callbacks.complete) {
                this.callbacks.complete(this);
            }
        }
    }


    start(callbacks) {
        if (this.figure == null || this.animationArray.length == 0) return;
        if (this.isRunning) {
            if (this.paused) {
                this.pause();
            }
            return;
        }
        if (callbacks != null) {
            this.callbacks = callbacks;
        }
        this._running = true;
        this._pause = false;
        this.figure.addEventListener(AbstractFigure.EVENT_BEFORE_PREPARE_SELF, this._loopFunction);
    }
}