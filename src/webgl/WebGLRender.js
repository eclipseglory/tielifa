import TextureManager from "../texture/TextureManager.js";
import Mat4 from "../math/Mat4.js";
import TempCanvas from "../texture/TempCanvas.js";
import Color from "../utils/Color.js";
import fragmentSource from "./FragmentShader.js";
import vertexSource from "./VertexShader.js"


let _program = Symbol('WebGL的program');
let _maxTransformMatrixNum = Symbol('转换矩阵变量可用的最大数量');
export default class WebGLRender {
    constructor(gl, p) {
        p = p || {};
        // console.log(source);
        this.gl = gl;
        this.DEBUG_DRAW_COUNT = 0;
        this.defaultTransformMatrix = Mat4.identity();
        this.orthoProjectionMatrix = Mat4.identity();
        this.perspectiveMatrix = Mat4.identity();
        this.cameraPosition = {x: 0, y: 0, z: 0};
        this.lookTarget = {x: undefined, y: undefined, z: undefined};
        let projectionType = p['projectionType'] || 0;
        this.backgroundColor = p['backgroundColor'] || '#000000';
        let textureMaxSize = p['textureMaxSize'] || gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
        // 这里的贴图大小最大设置为2000
        if (textureMaxSize > 2000) textureMaxSize = 2000;
        let maxVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        // 顶点作色器里已经用了一个mat4了，就是4个vector,减去这4个然后除以4就得到可以定义的最大mat4数组
        let maxTransformNum = p['maxTransformNum'] || Math.floor((maxVectors - 4) / 4);
        // debug:
        maxTransformNum = 2;
        this[_maxTransformMatrixNum] = maxTransformNum;
        this.enableDepthTest = p['enableDepthTest'];
        if (this.enableDepthTest == null) this.enableDepthTest = false;
        this.textureManager = null;
        this.vdo = null;
        // this.verticesData = null;
        // this.fragmentData = null;
        // this.indexData = null;
        // this.transformMatrixData = null;
        this.canvasWidth = -1;
        this.canvasHeight = -1;
        this.lightPosition = new Float32Array(3);
        this.lightPosition[0] = gl.canvas.width / 2;
        this.lightPosition[1] = gl.canvas.height / 2;
        this.lightPosition[2] = 0;
        this.ambientBrightness = new Float32Array(3);
        this.ambientBrightness[0] = 0.2;
        this.ambientBrightness[1] = 0.2;
        this.ambientBrightness[2] = 0.2;
        if (p['ambientCent'] != null) {
            this.ambientBrightness[0] = p['ambientCent'];
            this.ambientBrightness[1] = p['ambientCent'];
            this.ambientBrightness[2] = p['ambientCent'];
        }

        this.observerPosition = new Float32Array(3);
        this.observerPosition[0] = gl.canvas.width / 2;
        this.observerPosition[1] = gl.canvas.height / 2;
        this.observerPosition[2] = 0;
        this.lightColor = p['lightColor'] || '#ffffff';
        this.shininess = p['shininess'] || 256;
        this.projectionType = projectionType;
        this.fov = p['fov'] || 40;
        this.defaultDepth = 0;
        this.tempCanvas = p['tempCanvas'] || new TempCanvas();
        this.init();
        this.textureManager = new TextureManager(textureMaxSize, gl, 10, 1, this.tempCanvas);
        // this.textureManager.maxHeight = textureMaxSize;
        // this.textureManager.maxWidth = this.textureManager.maxHeight;
        let enableLight = p['enableLight'];
        if (enableLight == null) enableLight = false;
        this.enableLight(enableLight);
        this._lastVertexBufferSize = 0;
        this._lastFragmentBufferSize = 0;
        this._lastIndexBufferSize = 0;

    }

    get maxTransformMatrixNum() {
        return this[_maxTransformMatrixNum];
    }

    enableLight(flag) {
        let value = 0;
        if (flag) value = 1.0;
        else value = 0;
        this.gl.uniform1f(this.shaderInformation.enableLight, value);
    }

    get ambientLightBrightness() {
        return this.ambientBrightness[0];
    }

    set ambientLightBrightness(v) {
        this.ambientBrightness[0] = v;
        this.ambientBrightness[1] = v;
        this.ambientBrightness[2] = v;
    }

    clean(clearAllTexture) {
        this.DEBUG_DRAW_COUNT = 0;
        let color = Color.getInstance().convertStringToColor(this.backgroundColor);
        this.gl.clearColor(color[0] / 255, color[1] / 255, color[2] / 255, 1);
        // this.gl.colorMask(false, false, false, true);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.textureManager.clean(clearAllTexture);
    }

    initRending() {
        let gl = this.gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }

    setUniformTransformMatrix(matrix, id) {
        let gl = this.gl;
        gl.uniformMatrix4fv(this.shaderInformation.transformMatrixArray[id], false, matrix);
    }


    prepareWebGLBuffer() {
        let vbuffer = this.vdo.verticesData.buffer;
        let fbuffer = this.vdo.fragmentData.buffer;
        let ibuffer = this.vdo.indexData.dataArray;
        let gl = this.gl;
        let shaderInfo = this.shaderInformation;

        gl.enableVertexAttribArray(shaderInfo.vertexAttribute);
        // let vsize = vbuffer.byteLength;
        // if (vsize > this._lastVertexBufferSize) {
        //     gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.verticesBuffer);
        //     gl.bufferData(gl.ARRAY_BUFFER, vbuffer, gl.DYNAMIC_DRAW);
        // } else {
        //     gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.verticesBuffer);
        //     gl.bufferSubData(gl.ARRAY_BUFFER, 0, vbuffer);
        // }
        // this._lastVertexBufferSize = vsize;
        gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vbuffer, gl.DYNAMIC_DRAW);

        let size = 3;
        let type = gl.FLOAT;
        let normalize = false;
        let stride = 32;
        let offset = 0;
        gl.vertexAttribPointer(
            shaderInfo.vertexAttribute, size, type, normalize, stride, offset);
        //法向量数据：
        type = gl.FLOAT;
        size = 3;
        offset = 16;// 4 * 4;//因为有一个空的float32，所以要多移动4个字节
        normalize = true; //单位划该向量
        gl.vertexAttribPointer(
            shaderInfo.normalAttribute, size, type, normalize, stride, offset);

        gl.enableVertexAttribArray(shaderInfo.colorAttribute);
        gl.enableVertexAttribArray(shaderInfo.textureCoordAttribute);

        // let fsize = fbuffer.byteLength;
        // if (fsize > this._lastFragmentBufferSize) {
        //     gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.fragmentBuffer);
        //     gl.bufferData(gl.ARRAY_BUFFER, fbuffer, gl.DYNAMIC_DRAW);
        // } else {
        //     gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.fragmentBuffer);
        //     gl.bufferSubData(gl.ARRAY_BUFFER, 0, fbuffer);
        // }
        // this._lastFragmentBufferSize = fsize;

        gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.fragmentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, fbuffer, gl.DYNAMIC_DRAW);

        type = gl.UNSIGNED_BYTE;
        stride = this.vdo.fragmentData.singleDataByteLength;
        size = 3;
        offset = 0;
        normalize = false;
        gl.vertexAttribPointer(
            shaderInfo.colorAttribute, size, type, normalize, stride, offset);

        type = gl.UNSIGNED_BYTE;
        // stride = this.vdo.fragmentData.singleDataByteLength;
        size = 1;
        offset = 3;
        normalize = false;
        gl.vertexAttribPointer(
            shaderInfo.filterTypeAttribute, size, type, normalize, stride, offset);

        type = gl.FLOAT;
        size = 1;
        offset = 4;
        gl.vertexAttribPointer(
            shaderInfo.alphaAttribute, size, type, normalize, stride, offset);

        type = gl.FLOAT;
        size = 2;
        offset = 8;
        gl.vertexAttribPointer(
            shaderInfo.textureCoordAttribute, size, type, normalize, stride, offset);


        // gl.enableVertexAttribArray(shaderInfo.transformMatrixIndex);
        // gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.matrixIndexBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, this.transformMatrixData.buffer, gl.DYNAMIC_DRAW);
        // type = gl.FLOAT;
        // size = 1;
        // offset = 0;
        // stride = 4;
        // gl.vertexAttribPointer(shaderInfo.transformMatrixIndex, size, type, normalize, stride, offset);

        // let isize = ibuffer.byteLength;
        // if (isize > this._lastIndexBufferSize) {
        //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shaderInfo.indexDataBuffer);
        //     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ibuffer, gl.DYNAMIC_DRAW);
        // } else {
        //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shaderInfo.indexDataBuffer);
        //     gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, ibuffer);
        // }
        // this._lastIndexBufferSize = isize;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shaderInfo.indexDataBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ibuffer, gl.DYNAMIC_DRAW);
    }


    executeRenderAction(actionList) {
        if (this.vdo == null) return;
        this.prepareWebGLBuffer();
        let matrixIndex = 1; // 每次绘制都要重新设置矩阵的索引
        let lastAction = null;
        let startIndex = 0;
        let rendNumber = 0;
        let opacityActionArray = [];
        for (let i = 0; i < actionList.length; i++) {
            let currentAction = actionList[i];
            if (currentAction.opacityPointNumber !== 0) opacityActionArray.push(currentAction);
            if (currentAction.renderPointNumber === 0) continue;
            if (lastAction == null) lastAction = currentAction;
            if (currentAction.applyMatrix != lastAction.applyMatrix) {
                this.renderVertices(startIndex, rendNumber, lastAction.textureIndex, lastAction.applyMatrix);
                lastAction = currentAction;
                startIndex += rendNumber;
                rendNumber = currentAction.renderPointNumber;
            } else {
                if (currentAction.textureIndex != lastAction.textureIndex && currentAction.textureIndex != -1 && lastAction.textureIndex != -1) {
                    this.renderVertices(startIndex, rendNumber, lastAction.textureIndex, lastAction.applyMatrix);
                    lastAction = currentAction;
                    startIndex += rendNumber;
                    rendNumber = 0;
                }
                if (lastAction.textureIndex == -1 && currentAction.textureIndex != -1) {
                    lastAction = currentAction;
                }
                rendNumber += currentAction.renderPointNumber;
            }
            // 先收集顶点数据，顶点的矩阵在下一步再设置
            // if (currentAction.textureIndex != lastAction.textureIndex && currentAction.textureIndex != -1 && lastAction.textureIndex != -1) {
            //     this.renderVertices(startIndex, rendNumber, lastAction.textureIndex);
            //     lastAction = currentAction;
            //     startIndex += rendNumber;
            //     rendNumber = 0;
            // }
            // if (lastAction.textureIndex == -1 && currentAction.textureIndex != -1) {
            //     lastAction = currentAction;
            // }
            // rendNumber += currentAction.renderPointNumber;
        }

        if (lastAction != undefined) {
            this.renderVertices(startIndex, rendNumber, lastAction.textureIndex, lastAction.applyMatrix);
        }

        //绘制透明：
        if (opacityActionArray.length == 0) return;
        // this.prepareWebGLBuffer(true);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.shaderInformation.indexDataBuffer);
        // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexData.dataArray, gl.DYNAMIC_DRAW);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.vdo.opacityIndexData.dataArray, this.gl.DYNAMIC_DRAW);
        this.gl.depthMask(false);
        matrixIndex = 1; // 每次绘制都要重新设置矩阵的索引
        lastAction = null;
        startIndex = 0;
        rendNumber = 0;
        for (let i = 0; i < opacityActionArray.length; i++) {
            let currentAction = opacityActionArray[i];
            if (lastAction == null) lastAction = currentAction;
            if (currentAction.applyMatrix != lastAction.applyMatrix) {
                this.renderVertices(startIndex, rendNumber, lastAction.textureIndex, lastAction.applyMatrix);
                lastAction = currentAction;
                startIndex += rendNumber;
                rendNumber = currentAction.opacityPointNumber;
            } else {
                if (currentAction.textureIndex != lastAction.textureIndex && currentAction.textureIndex != -1 && lastAction.textureIndex != -1) {
                    this.renderVertices(startIndex, rendNumber, lastAction.textureIndex, lastAction.applyMatrix);
                    lastAction = currentAction;
                    startIndex += rendNumber;
                    rendNumber = 0;
                }
                if (lastAction.textureIndex == -1 && currentAction.textureIndex != -1) {
                    lastAction = currentAction;
                }
                rendNumber += currentAction.opacityPointNumber;
            }
            // 先收集顶点数据，顶点的矩阵在下一步再设置
            // if (currentAction.textureIndex != lastAction.textureIndex && currentAction.textureIndex != -1 && lastAction.textureIndex != -1) {
            //     this.renderVertices(startIndex, rendNumber, lastAction.textureIndex);
            //     lastAction = currentAction;
            //     startIndex += rendNumber;
            //     rendNumber = 0;
            // }
            // if (lastAction.textureIndex == -1 && currentAction.textureIndex != -1) {
            //     lastAction = currentAction;
            // }
            // rendNumber += currentAction.renderPointNumber;
        }

        if (lastAction != undefined) {
            this.renderVertices(startIndex, rendNumber, lastAction.textureIndex, lastAction.applyMatrix);
        }

        this.gl.depthMask(true);
    }


    renderVertices(startIndex, renderPointNumber, textureIndex, transformMatrix) {
        if (renderPointNumber == 0) {
            return;
        }
        let gl = this.gl;
        this.initProjectionMatrix();
        if (transformMatrix != null) {
            let m = Mat4.identity();
            Mat4.multiply(m, transformMatrix, this.defaultTransformMatrix);
            gl.uniformMatrix4fv(this.shaderInformation.transformMatrixArray[0], false, m);
        }
        let lightColor = Color.getInstance().convertStringToColor(this.lightColor);
        this.gl.uniform3f(this.shaderInformation.lightPosition, this.lightPosition[0], this.lightPosition[1], this.lightPosition[2]);

        this.gl.uniform3f(this.shaderInformation.observerPosition, this.observerPosition[0], this.observerPosition[1], this.observerPosition[2]);

        this.gl.uniform1f(this.shaderInformation.shininess, this.shininess);
        this.gl.uniform3f(this.shaderInformation.ambientColorCent, this.ambientBrightness[0], this.ambientBrightness[1], this.ambientBrightness[2]);
        this.gl.uniform3f(this.shaderInformation.lightColor, lightColor[0] / 255, lightColor[1] / 255, lightColor[2] / 255);
        this.configTexture(textureIndex);
        // offset 是字节偏移，所以要乘以2，因为每一个index是2个字节
        gl.drawElements(gl.TRIANGLES, renderPointNumber, gl.UNSIGNED_SHORT, startIndex * 2);
        this.DEBUG_DRAW_COUNT++;
    }

    initProjectionMatrix() {
        let gl = this.gl;
        let halfFOVRadian = this.fov * Math.PI / 360;

        // 设置透视矩阵
        // if (this.canvasHeight != gl.canvas.height && this.canvasWidth != gl.canvas.width) {
        // let t = Math.tan((this.fov) * Math.PI / 180);
        // let defaultDepth = -gl.canvas.height / (2 * t);
        let t = Math.tan(halfFOVRadian);
        this.defaultDepth = -gl.canvas.height / (2 * t);
        // 为了配合预设的深度
        Mat4.identityMatrix(this.defaultTransformMatrix);
        Mat4.translationMatrix(this.defaultTransformMatrix, 0, 0, this.defaultDepth);
        gl.uniformMatrix4fv(this.shaderInformation.transformMatrixArray[0], false, this.defaultTransformMatrix);
        let m1;
        let near = 1;

        this.initLookAtTarget(this.defaultDepth);
        let cm = Mat4.lookAt(this.cameraPosition, this.lookTarget);
        Mat4.inverse(cm, cm);

        if (this.projectionType == 0) {
            m1 = Mat4.orthoProjection(0, 0, gl.canvas.width, gl.canvas.height, near, Math.abs(this.defaultDepth * 2), this.orthoProjectionMatrix);
            Mat4.multiply(m1, m1, cm);

        } else {
            m1 = Mat4.perspective3(halfFOVRadian * 2, gl.canvas.width, gl.canvas.height, near, Math.abs(this.defaultDepth * 10), this.perspectiveMatrix);
            Mat4.multiply(m1, m1, cm);
        }
        gl.uniformMatrix4fv(this.shaderInformation.perspectiveMatrix, false, m1);
        this.canvasHeight = gl.canvas.height;
        this.canvasWidth = gl.canvas.width;
        // }
    }

    initLookAtTarget(defaultDepth) {
        if (this.lookTarget.x === undefined) {
            this.lookTarget.x = 0;
        }
        if (this.lookTarget.y === undefined) {
            this.lookTarget.y = 0;
        }
        if (this.lookTarget.z === undefined) {
            this.lookTarget.z = defaultDepth;
        }
    }


    setLightPosition(x, y, z) {
        this.lightPosition[0] = x;
        this.lightPosition[1] = y;
        this.lightPosition[2] = z;
    }

    configTexture(textureIndex) {
        if (textureIndex == null) textureIndex = -1;
        let gl = this.gl;
        let shaderInfo = this.shaderInformation;
        gl.uniform1i(shaderInfo.textureLocation, 0);
        let texture;
        let c;
        if (textureIndex === -1) {
            texture = shaderInfo.blackTexture;
            c = {width: 1, height: 1};
        } else {
            texture = this.textureManager.textureArray[textureIndex];
            c = {width: texture.width, height: texture.height};
            texture = texture.glTexture;
        }
        gl.uniform2f(shaderInfo.singleCanvas, c.width, c.height);
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }

    createShaderProgram() {
        let gl = this.gl;
        const vertexShader = this.loadShader(gl.VERTEX_SHADER, this.getVertexShaderSource(this.maxTransformMatrixNum));
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fragmentSource);

        // 创建Shader程序，一个是顶点shader一个是片段shader
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('无法初始化Program: ' + gl.getProgramInfoLog(shaderProgram));
            gl.deleteProgram(shaderProgram);
            return null;
        }
        gl.useProgram(shaderProgram);
        return shaderProgram;
    }

    init() {
        let gl = this.gl;
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        if (this.enableDepthTest) {
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
        } else {
            this.gl.disable(this.gl.DEPTH_TEST);
        }
        this[_program] = this.createShaderProgram();
        let program = this[_program];
        this.shaderInformation = this.initShaderInformation(program);
        this.initProjectionMatrix();
    }

    // setPerspective(viewAngel, near, far) {
    //     let aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
    //     let m = Mat4.perspective2(0, 0, this.gl.canvas.clientWidth, this.gl.canvas.clientHeight, near, far);
    //     m = Mat4.perspective(viewAngel, aspect, near, far);
    //     m = Mat4.perspective3(viewAngel, this.gl.canvas.clientWidth, this.gl.canvas.clientHeight, near, far);
    //     this.gl.uniformMatrix4fv(this.shaderInformation.perspectiveMatrix, false, m);
    // }

    initShaderInformation(program) {
        let gl = this.gl;

        let textureCoordAttribute = gl.getAttribLocation(program, "u_texCoord");
        gl.enableVertexAttribArray(textureCoordAttribute);

        let filterTypeAttribute = gl.getAttribLocation(program, "u_filterType");
        gl.enableVertexAttribArray(filterTypeAttribute);

        let vertexAttribute = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(vertexAttribute);

        let normalAttribute = gl.getAttribLocation(program, "a_normal");
        gl.enableVertexAttribArray(normalAttribute);

        // let transformMatrixIndex = gl.getAttribLocation(program, "transform_matrix_index");
        // gl.enableVertexAttribArray(transformMatrixIndex);

        let colorAttribute = gl.getAttribLocation(program, 'color');
        gl.enableVertexAttribArray(colorAttribute);

        let alphaAttribute = gl.getAttribLocation(program, 'alpha');
        gl.enableVertexAttribArray(alphaAttribute);


        // 转化矩阵全局变量
        let perspectiveMatrix = gl.getUniformLocation(program, "perspective_matrix");
        let transformMatrixArray = new Array(this.maxTransformMatrixNum);
        for (let i = 0; i < transformMatrixArray.length; i++) {
            transformMatrixArray[i] = gl.getUniformLocation(program, "transform_matrix_array[" + i + "]");
        }

        let singleCanvas = gl.getUniformLocation(program, "singleCanvas");
        let lightPosition = gl.getUniformLocation(program, "u_lightPosition");
        let ambientColorCent = gl.getUniformLocation(program, "u_Ambient_color");
        let shininess = gl.getUniformLocation(program, "u_Shininess");
        let observerPosition = gl.getUniformLocation(program, "u_ObserverPosition");
        let lightColor = gl.getUniformLocation(program, "u_lightColor");
        let enableLight = gl.getUniformLocation(program, "enableLight");
        let textureLocation = gl.getUniformLocation(program, "u_texture[0]");
        // 创建数据缓存
        let verticesBuffer = gl.createBuffer();
        let matrixIndexBuffer = gl.createBuffer();
        let fragmentBuffer = gl.createBuffer();
        let indexDataBuffer = gl.createBuffer();

        let blackTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, blackTexture);
        let blackPixel = new Uint8Array([255, 255, 255, 255]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blackPixel);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return {
            observerPosition: observerPosition,
            vertexAttribute: vertexAttribute,
            normalAttribute: normalAttribute,
            colorAttribute: colorAttribute,
            filterTypeAttribute: filterTypeAttribute,
            alphaAttribute: alphaAttribute,
            textureCoordAttribute: textureCoordAttribute,
            verticesBuffer: verticesBuffer,
            fragmentBuffer: fragmentBuffer,
            matrixIndexBuffer: matrixIndexBuffer,
            indexDataBuffer: indexDataBuffer,
            perspectiveMatrix: perspectiveMatrix,
            transformMatrixArray: transformMatrixArray,
            // transformMatrixIndex: transformMatrixIndex,
            singleCanvas: singleCanvas,
            textureLocation: textureLocation,
            blackTexture: blackTexture,
            lightPosition: lightPosition,
            ambientColorCent: ambientColorCent,
            shininess: shininess,
            lightColor: lightColor,
            enableLight: enableLight,
            webgl: gl
        }
    }

    /**
     * 创建作色器
     * @param type 着色器类型
     * @param source 代码源
     * @returns {*} Shader对象
     */
    loadShader(type, source) {
        let gl = this.gl;
        let shader = gl.createShader(type);
        // 把GLSL代码给shader
        gl.shaderSource(shader, source);
        // 编译着色器程序
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('着色器编译错误: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    getVertexShaderSource(transformMatrixCount) {
        return vertexSource.replace("@transformMatrixCount", transformMatrixCount.toString());
    }
}