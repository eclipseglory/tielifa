import Figure3D from "../figure/Figure3D.js";
import Tools from "../utils/Tools.js";

export default class CoordinateSystemFigure extends Figure3D {
    constructor(p) {
        p = p || {};
        super(p);
        this.originalPoint = p.originalPoint || {x: 0, y: 0, z: 0};
        this.longitude;
        this.latitude;
        this.lal = p.lal || {
            xy: {
                original: true,
                lonOriginalWidth: 1,
                lonOriginalColor: null,
                latOriginalWidth: 1,
                latOriginalColor: null,
                lonWidth: 1,
                latWidth: 1,
                lonExtendLength: 0,
                lonExtendAngle: 0,
                lonExtendLength2: 0,
                lonExtendAngle2: 0,
                latExtendLength: 0,
                latExtendAngle: 0,
                latExtendLength2: 0,
                latExtendAngle2: 0,
                lonNum: 0,
                latNum: 0,
                lonColor: null,
                latColor: null,
                lonBgc: null,
                lonBgc2: null,
                latBgc: null,
                latBgc2: null,
                drawLonFirst: true,
                drawLonLast: true,
                drawLatFirst: true,
                drawLatLast: true
            },
            xz: {
                original: true,
                lonOriginalWidth: 1,
                lonOriginalColor: null,
                latOriginalWidth: 1,
                latOriginalColor: null,
                lonWidth: 1,
                latWidth: 1,
                lonExtendLength: 0,
                lonExtendAngle: 0,
                lonExtendLength2: 0,
                lonExtendAngle2: 0,
                latExtendLength: 0,
                latExtendAngle: 0,
                latExtendLength2: 0,
                latExtendAngle2: 0,
                lonNum: 0,
                latNum: 0,
                lonColor: null,
                latColor: null,
                lonBgc: null,
                lonBgc2: null,
                latBgc: null,
                latBgc2: null,
                drawLonFirst: true,
                drawLonLast: true,
                drawLatFirst: true,
                drawLatLast: true
            },
            yz: {
                original: true,
                lonOriginalWidth: 1,
                lonOriginalColor: null,
                latOriginalWidth: 1,
                latOriginalColor: null,
                lonWidth: 1,
                latWidth: 1,
                lonExtendLength: 0,
                lonExtendAngle: 0,
                lonExtendLength2: 0,
                lonExtendAngle2: 0,
                latExtendLength: 0,
                latExtendAngle: 0,
                latExtendLength2: 0,
                latExtendAngle2: 0,
                lonNum: 0,
                latNum: 0,
                lonColor: null,
                latColor: null,
                lonBgc: null,
                lonBgc2: null,
                latBgc: null,
                latBgc2: null,
                drawLonFirst: true,
                drawLonLast: true,
                drawLatFirst: true,
                drawLatLast: true
            },
        };

    }

    drawLAL(ctx, x, y, z, hWidth, hHeight, surfaceKey) {
        let lal = this.lal[surfaceKey];
        let depthSpace = 0.1;
        if (lal != null) {
            let latBgDepth = z + depthSpace;//让线绘制在面的正前方
            let lonBgDepth = latBgDepth + depthSpace;
            let latDepth = lonBgDepth + depthSpace;
            let lonDepth = latDepth + depthSpace;
            ctx.save();
            let lonColor = lal.lonColor || 'white';
            let latColor = lal.latColor || 'white';
            let original = lal.original;
            let lonWidth = lal.lonWidth || 1;
            let latWidth = lal.latWidth || 1;
            let hLonWidth = lonWidth / 2;
            let hLatWidth = latWidth / 2;
            let lonOriginalWidth = lal.lonOriginalWidth || 0;
            let lonOriginalColor = lal.lonOriginalColor || 'white';
            let latOriginalWidth = lal.latOriginalWidth || 0;
            let latOriginalColor = lal.latOriginalColor || 'white';

            let latExtendLength = lal.latExtendLength || 0;
            let latExtendAngle = lal.latExtendAngle || 0;
            let latExtendRadian = latExtendAngle * Tools.PIDIV180;
            let latExtendLength2 = lal.latExtendLength2 || 0;
            let latExtendAngle2 = lal.latExtendAngle2 || 0;
            let latExtendRadian2 = latExtendAngle2 * Tools.PIDIV180;

            let lonExtendLength = lal.lonExtendLength || 0;
            let lonExtendAngle = lal.lonExtendAngle || 0;
            let lonExtendRadian = lonExtendAngle * Tools.PIDIV180;
            let lonExtendLength2 = lal.lonExtendLength2 || 0;
            let lonExtendAngle2 = lal.lonExtendAngle2 || 0;
            let lonExtendRadian2 = lonExtendAngle2 * Tools.PIDIV180;

            if (lonOriginalWidth !== 0) {
                ctx.fillStyle = lonOriginalColor;
                ctx.fillRect(-hWidth, y - hLonWidth, hWidth * 2, lonOriginalWidth, lonDepth);

                //绘制延伸线：
                if (lonExtendLength !== 0) {
                    ctx.save();
                    ctx.translate(-hWidth, y, lonDepth);
                    if (lonExtendRadian !== 0) {
                        ctx.rotateY(lonExtendRadian);
                    }
                    ctx.fillRect(-lonExtendLength, -hLonWidth, lonExtendLength, hLonWidth * 2, 0);
                    ctx.restore();
                }
                if (lonExtendLength2 !== 0) {
                    ctx.save();
                    ctx.translate(hWidth, y, lonDepth);
                    if (lonExtendRadian2 !== 0) {
                        ctx.rotateY(lonExtendRadian);
                    }
                    ctx.fillRect(0, -hLonWidth, lonExtendLength, hLonWidth * 2, 0);
                    ctx.restore();
                }
            }
            if (latOriginalWidth !== 0) {
                ctx.fillStyle = latOriginalColor;
                ctx.fillRect(x - hLatWidth, -hHeight, latOriginalWidth, hHeight * 2, latDepth);
                //绘制延伸线：
                if (latExtendLength !== 0) {
                    ctx.save();
                    ctx.translate(x, -hHeight, latDepth);
                    if (latExtendRadian !== 0) {
                        ctx.rotateX(latExtendRadian);
                    }
                    ctx.fillRect(-hLatWidth, -latExtendLength, hLatWidth * 2, latExtendLength, 0);
                    ctx.restore();
                }
                if (latExtendLength2 !== 0) {
                    ctx.save();
                    ctx.translate(x, hHeight, latDepth);
                    if (latExtendRadian2 !== 0) {
                        ctx.rotateX(latExtendRadian2);
                    }
                    ctx.fillRect(-hLatWidth, 0, hLatWidth * 2, latExtendLength2, 0);
                    ctx.restore();
                }
            }

            let lonNum = lal.lonNum;
            if (lonNum == null) lonNum = 0;
            if (lonNum !== 0) {
                let preHeight = hHeight * 2 / lonNum;
                let drawLonFirst = lal.drawLonFirst;
                if (drawLonFirst == null) drawLonFirst = true;
                let drawLonLast = lal.drawLonLast;
                if (drawLonLast == null) drawLonLast = true;
                let startY = -hHeight;
                let startX = -hWidth;
                let bgc = lal.lonBgc;
                let bgc2 = lal.lonBgc2 || bgc;

                for (let i = 0; i < lonNum + 1; i++, startY += preHeight) {
                    if (bgc != null) {
                        if (i % 2 === 0) {
                            ctx.fillStyle = bgc;
                        } else {
                            ctx.fillStyle = bgc2;
                        }
                        if (i < lonNum)
                            ctx.fillRect(startX, startY, hWidth * 2, preHeight, lonBgDepth);
                        // if (i === lonNum) {
                        //     let finalHeight = hHeight - startY;
                        //     ctx.fillRect(startX, startY, hWidth * 2, finalHeight, lonBgDepth);
                        // }
                    }
                    if (i === 0 && !drawLonFirst) continue;
                    if (i === lonNum + 1 && !drawLonLast) continue;
                    if (startY === y && original) continue;
                    ctx.fillStyle = lonColor;
                    ctx.fillRect(startX, startY - hLonWidth, hWidth * 2, lonWidth, lonDepth);
                    //绘制延伸线：
                    if (lonExtendLength !== 0) {
                        ctx.save();
                        ctx.translate(startX, startY, lonDepth);
                        if (lonExtendRadian !== 0) {
                            ctx.rotateY(lonExtendRadian);
                        }
                        ctx.fillRect(-lonExtendLength, -hLonWidth, lonExtendLength, hLonWidth * 2, 0);
                        ctx.restore();
                    }
                    if (lonExtendLength2 !== 0) {
                        ctx.save();
                        ctx.translate(startX + hWidth * 2, startY, lonDepth);
                        if (lonExtendRadian2 !== 0) {
                            ctx.rotateY(lonExtendRadian);
                        }
                        ctx.fillRect(0, -hLonWidth, lonExtendLength, hLonWidth * 2, 0);
                        ctx.restore();
                    }
                }
            }
            let latNum = lal.latNum;
            if (latNum == null) latNum = 0;
            if (latNum !== 0) {
                let perWidth = hWidth * 2 / latNum;
                let drawLatFirst = lal.drawLatFirst;
                if (drawLatFirst == null) drawLatFirst = true;
                let drawLatLast = lal.drawLatLast;
                if (drawLatLast == null) drawLatLast = true;

                let startY = -hHeight;
                let startX = -hWidth;

                let bgc = lal.latBgc;
                let bgc2 = lal.latBgc2 || bgc;

                for (let i = 0; i < latNum + 1; i++, startX += perWidth) {
                    if (bgc != null) {
                        if (i < latNum) {
                            if (i % 2 === 0) {
                                ctx.fillStyle = bgc;
                            } else {
                                ctx.fillStyle = bgc2;
                            }
                            ctx.fillRect(startX, startY, perWidth, hHeight * 2, latBgDepth);
                        }
                    }
                    if (i === 0 && !drawLatFirst) continue;
                    if (i === latNum + 1 && !drawLatLast) continue;
                    if (startX === x && original) continue;
                    ctx.fillStyle = latColor;
                    ctx.fillRect(startX - hLatWidth, startY, latWidth, hHeight * 2, latDepth);

                    //绘制延伸线：
                    if (latExtendLength !== 0) {
                        ctx.save();
                        ctx.translate(startX, startY, latDepth);
                        if (latExtendRadian !== 0) {
                            ctx.rotateX(latExtendRadian);
                        }
                        ctx.fillRect(-hLatWidth, -latExtendLength, hLatWidth * 2, latExtendLength, 0);
                        ctx.restore();
                    }
                    if (latExtendLength2 !== 0) {
                        ctx.save();
                        ctx.translate(startX, startY + hHeight * 2, latDepth);
                        if (latExtendRadian2 !== 0) {
                            ctx.rotateX(latExtendRadian2);
                        }
                        ctx.fillRect(-hLatWidth, 0, hLatWidth * 2, latExtendLength2, 0);
                        ctx.restore();
                    }
                }
            }

            ctx.restore();
        }
    }

    drawCoordSurface(ctx, left, top, right, bottom, depth, surfaceKey, index) {
        if (left === right || bottom === top) return;
        ctx.fillRect(left, top, right - left, bottom - top, depth);
    }

    drawSurface(ctx, x, y, z, hWidth, hHeight, surfaceKey) {

        let left = x;
        let top = -hHeight;
        let right = hWidth;
        let bottom = y;
        let depth = z;

        ctx.fillStyle = 'red';
        //第1象限：
        this.drawCoordSurface(ctx, left, top, right, bottom, depth, surfaceKey, 1);

        // 第2象限：
        ctx.fillStyle = 'purple';
        left = x;
        top = y;
        right = hWidth;
        bottom = hHeight;
        this.drawCoordSurface(ctx, left, top, right, bottom, depth, surfaceKey, 2);

        // 第3象限：
        ctx.fillStyle = 'green';
        left = -hWidth;
        top = y;
        right = x;
        bottom = hHeight;
        this.drawCoordSurface(ctx, left, top, right, bottom, depth, surfaceKey, 3);

        // 第4象限：
        ctx.fillStyle = 'white';
        left = -hWidth;
        top = -hHeight;
        right = x;
        bottom = y;
        this.drawCoordSurface(ctx, left, top, right, bottom, depth, surfaceKey, 4);
    }

    drawSelf(ctx) {
        let width = this.width;
        let hWidth = width / 2;
        let height = this.height;
        let hHeight = height / 2;
        let depth = this.depth;
        let hDepth = depth / 2;
        let original = this.originalPoint;


        // xy面：
        ctx.save();
        let x = original.x * hWidth;
        let y = -original.y * hHeight;
        let z = original.z * hDepth;
        this.drawLAL(ctx, x, y, z, hWidth, hHeight, 'xy');
        // this.drawSurface(ctx, x, y, z, hWidth, hHeight, 'xy');
        ctx.restore();

        //切换到XZ面：
        ctx.save();
        ctx.rotateX(Tools.HALFPI);
        x = original.x * hWidth;
        y = original.z * hDepth;
        z = original.y * hHeight;
        this.drawLAL(ctx, x, y, z, hWidth, hDepth, 'xz');
        // this.drawSurface(ctx, x, y, z, hWidth, hDepth, 'xz');
        ctx.restore();

        //切换到YZ面：
        ctx.save();
        ctx.rotateY(Tools.HALFPI);
        x = -original.z * hDepth;
        y = -original.y * hHeight;
        z = original.x * hWidth;
        this.drawLAL(ctx, x, y, z, hDepth, hHeight, 'yz');
        // this.drawSurface(ctx, x, y, z, hDepth, hHeight, 'yz');
        ctx.restore();
    }
}