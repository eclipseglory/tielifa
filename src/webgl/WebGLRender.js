import TextureManager from "../texture/TextureManager.js";
import Mat4 from "../math/Mat4.js";

let fsSource = `
  precision mediump float;
  varying vec4 currentColor;
  varying vec2 v_texcoord;
  varying vec3 normal;
  varying vec3 v_position;
  varying float v_filterType;
  uniform vec2 singleCanvas;
  uniform vec3 u_lightPosition;
  uniform float enableLight;
  uniform sampler2D u_texture;
  
  void getNormalFilter(inout float filter[9]){
        filter[0] = 0.0;
        filter[1] = 0.0;
        filter[2] = 0.0;
        filter[3] = 0.0;
        filter[4] = 1.0;
        filter[5] = 0.0;
        filter[6] = 0.0;
        filter[7] = 0.0;
        filter[8] = 0.0;
  }
  
  void getGaussianBlurFilter(inout float filter[9]){
        filter[0] = 0.045;
        filter[1] = 0.122;
        filter[2] = 0.045;
        filter[3] = 0.122;
        filter[4] = 0.332;
        filter[5] = 0.122;
        filter[6] = 0.045;
        filter[7] = 0.122;
        filter[8] = 0.045;
  }
  
  void getUnsharpenFilter(inout float filter[9]){
        filter[0] = -1.0;
        filter[1] = -1.0;
        filter[2] = -1.0;
        filter[3] = -1.0;
        filter[4] = 9.0;
        filter[5] = -1.0;
        filter[6] = -1.0;
        filter[7] = -1.0;
        filter[8] = -1.0;
  }
  
  void getSharpnessFilter(inout float filter[9]){
        filter[0] = 0.0;
        filter[1] = -1.0;
        filter[2] = 0.0;
        filter[3] = -1.0;
        filter[4] = 5.0;
        filter[5] = -1.0;
        filter[6] = 0.0;
        filter[7] = -1.0;
        filter[8] = 0.0;
  }
  
   void getSharpenFilter(inout float filter[9]){
        filter[0] = -0.125;
        filter[1] = -0.125;
        filter[2] = -0.125;
        filter[3] = -0.125;
        filter[4] =  2.0;
        filter[5] = -0.125;
        filter[6] = -0.125;
        filter[7] = -0.125;
        filter[8] = -0.125;
  }
  
  void getEdgeDetectFilter(inout float filter[9]){
        filter[0] = -5.0;
        filter[1] = -5.0;
        filter[2] = -5.0;
        filter[3] = -5.0;
        filter[4] =  39.0;
        filter[5] = -5.0;
        filter[6] = -5.0;
        filter[7] = -5.0;
        filter[8] = -5.0;
  }
  
  void getSobelHorizontalFilter(inout float filter[9]){
        filter[0] = 1.0;
        filter[1] = 2.0;
        filter[2] = 1.0;
        filter[3] = 0.0;
        filter[4] =  0.0;
        filter[5] = 0.0;
        filter[6] = -1.0;
        filter[7] = -2.0;
        filter[8] = -1.0;
  }
  
  void getSobelVerticalFilter(inout float filter[9]){
        filter[0] = 1.0;
        filter[1] = 0.0;
        filter[2] = -1.0;
        filter[3] = 2.0;
        filter[4] =  0.0;
        filter[5] = -2.0;
        filter[6] = 1.0;
        filter[7] = 0.0;
        filter[8] = -1.0;
  }
  
  void getPrevitHorizontalFilter(inout float filter[9]){
        filter[0] = 1.0;
        filter[1] = 1.0;
        filter[2] = 1.0;
        filter[3] = 0.0;
        filter[4] = 0.0;
        filter[5] = 0.0;
        filter[6] = -1.0;
        filter[7] = -1.0;
        filter[8] = -1.0;
  }
  
  void getPrevitVerticalFilter(inout float filter[9]){
        filter[0] = 1.0;
        filter[1] = 0.0;
        filter[2] = -1.0;
        filter[3] = 1.0;
        filter[4] = 0.0;
        filter[5] = -1.0;
        filter[6] = 1.0;
        filter[7] = 0.0;
        filter[8] = -1.0;
  }
  
  void getBoxBlurFilter(inout float filter[9]){
        filter[0] = 0.111;
        filter[1] = 0.111;
        filter[2] = 0.111;
        filter[3] = 0.111;
        filter[4] = 0.111;
        filter[5] = 0.111;
        filter[6] = 0.111;
        filter[7] = 0.111;
        filter[8] = 0.111;
  }
  
  void getTriangleBlurFilter(inout float filter[9]){
        filter[0] = 0.0625;
        filter[1] = 0.125;
        filter[2] = 0.0625;
        filter[3] = 0.125;
        filter[4] = 0.25;
        filter[5] = 0.125;
        filter[6] = 0.0625;
        filter[7] = 0.125;
        filter[8] = 0.0625;
  }
  
  void getEmbossFilter(inout float filter[9]){
        filter[0] = -2.0;
        filter[1] = -1.0;
        filter[2] = 0.0;
        filter[3] = -1.0;
        filter[4] = 1.0;
        filter[5] = 1.0;
        filter[6] = 0.0;
        filter[7] = 1.0;
        filter[8] = 2.0;
  }
  
  void filter3(in float kernel[9],in vec2 coord,in vec2 onePixel, inout vec4 colorSum){
        float offset = -1.0;
        for(float i = 0.0 ; i < 3.0;i++){
            for(float j =0.0;j < 3.0;j++){
                colorSum += texture2D(u_texture, coord + onePixel * vec2(offset + j, offset+ i)) * kernel[int(i*3.0+j)];
            }
        }
  }
  
  void filter5(in float kernel[25],in vec2 coord,in vec2 onePixel, inout vec4 colorSum){
        float offset = -2.0;
        for(float i = 0.0 ; i < 5.0;i++){
            for(float j =0.0;j < 5.0;j++){
                colorSum += texture2D(u_texture, coord + onePixel * vec2(offset + j, offset+ i)) * kernel[int(i*5.0+j)];
            }
        }
  }
  
  void main() {
        vec2 coord = vec2(v_texcoord.x / singleCanvas.x , v_texcoord.y/singleCanvas.y);
        vec2 onePixel = vec2(1.0/singleCanvas.x, 1.0/singleCanvas.y);
        vec4 color = currentColor;
        float opacity = texture2D(u_texture, coord).a * color.a;
        float kernel3[9];
        float kernel5[25];
        vec4 colorSum = vec4(0.0,0.0,0.0,0.0);
        
        if(int(v_filterType) == 0){
            getNormalFilter(kernel3);
            filter3(kernel3,coord,onePixel,colorSum);
        }else
        if(int(v_filterType) == 1){
            getGaussianBlurFilter(kernel3);
            filter3(kernel3,coord,onePixel,colorSum);
        }else
        if(int(v_filterType) == 2){
            getUnsharpenFilter(kernel3);
            filter3(kernel3,coord,onePixel,colorSum);
        }
        else
        if(int(v_filterType) == 3){
            getSharpnessFilter(kernel3);
            filter3(kernel3,coord,onePixel,colorSum);
        }else
        if(int(v_filterType) == 4){
            getSharpenFilter(kernel3);
            filter3(kernel3,coord,onePixel,colorSum);
        }else
        if(int(v_filterType) == 5){
            getEdgeDetectFilter(kernel3);
            filter3(kernel3,coord,onePixel,colorSum);
        }else
        if(int(v_filterType) == 6){
            getSobelHorizontalFilter(kernel3);
            filter3(kernel3,coord,onePixel,colorSum);
        }else
        if(int(v_filterType) == 7){
            getSobelVerticalFilter(kernel3);
            filter3(kernel3,coord,onePixel,colorSum);
        }else
        if(int(v_filterType) == 8){
            getPrevitHorizontalFilter(kernel3);
            filter3(kernel3,coord,onePixel,colorSum);
        }else
        if(int(v_filterType) == 9){
            getPrevitVerticalFilter(kernel3);
            filter3(kernel3,coord,onePixel,colorSum);
        }else
        if(int(v_filterType) == 10){
            getBoxBlurFilter(kernel3);
            filter3(kernel3,coord,onePixel,colorSum);
        }else
        if(int(v_filterType) == 11){
            getTriangleBlurFilter(kernel3);
            filter3(kernel3,coord,onePixel,colorSum);
        }else
        if(int(v_filterType) == 12){
            getEmbossFilter(kernel3);
            filter3(kernel3,coord,onePixel,colorSum);
        }

        
        // colorSum.w = opacity;
        // colorSum = texture2D(u_texture, coord);
        vec3 r_normal = normalize(normal);    
        vec3 forward = u_lightPosition - v_position;
        // vec3 lightLocation = vec3(0.0,0.0,1.0); 
        vec3 lightLocation = normalize(forward);    
        gl_FragColor = color * colorSum;//texture2D(u_texture, coord);
        gl_FragColor.a = opacity;
        float light = abs(dot(r_normal,lightLocation));
        //if(opacity < 1.0) light = abs(light);
        if(enableLight == 1.0){
            gl_FragColor.rgb *= light;
            // gl_FragColor.rgb = vec3(light,light,light);
        }
  }
  `;
/**
 precision mediump float;
 varying vec4 currentColor;
 varying vec2 v_texcoord;
 uniform vec2 singleCanvas;
 uniform sampler2D u_texture;
 void main() {
        vec2 coord = vec2(v_texcoord.x / singleCanvas.x , v_texcoord.y/singleCanvas.y);
        vec4 color = currentColor;
        gl_FragColor = color * texture2D(u_texture,coord);
  }
 */


let _program = Symbol('WebGL的program');
let _maxTransformMatrixNum = Symbol('转换矩阵变量可用的最大数量');
export default class WebGLRender {
    constructor(gl, maxTransformNum, textureMaxSize, projectionType, fov, enableLight, enableDepthTest) {
        this.gl = gl;
        this.DEBUG_DRAW_COUNT = 0;
        this.defaultTransformMatrix = Mat4.identity();
        this.orthoProjectionMatrix = Mat4.identity();
        this.perspectiveMatrix = Mat4.identity();
        this.cameraPosition = {x: 0, y: 0, z: 0};
        this.lookTarget = {x: undefined, y: undefined, z: undefined};
        projectionType = projectionType || 0;
        textureMaxSize = textureMaxSize || gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
        let maxVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        // 顶点作色器里已经用了一个mat4了，就是4个vector,减去这4个然后除以4就得到可以定义的最大mat4数组
        maxTransformNum = maxTransformNum || Math.floor((maxVectors - 4) / 4);
        // debug:
        maxTransformNum = 2;
        this[_maxTransformMatrixNum] = maxTransformNum;
        this.enableDepthTest = enableDepthTest || false;
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
        this.projectionType = projectionType;
        this.fov = fov;
        this.defaultDepth = 0;
        this.init();
        this.textureManager.maxHeight = textureMaxSize;
        this.textureManager.maxWidth = this.textureManager.maxHeight;
        enableLight = enableLight || false;
        this.enableLight(enableLight);

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

    clean(cleanTexture) {
        this.DEBUG_DRAW_COUNT = 0;
        this.gl.clearColor(0, 0, 0, 1);
        // this.gl.colorMask(false, false, false, true);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        if (cleanTexture == null) cleanTexture = false;
        if (cleanTexture) {
            this.textureManager.clean();
        }
    }

    initRending() {
        let gl = this.gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }

    setUniformTransformMatrix(matrix, id) {
        let gl = this.gl;
        gl.uniformMatrix4fv(this.shaderInformation.transformMatrixArray[id], false, matrix);
    }


    prepareWebGLBuffer(opacity) {
        if (opacity == undefined) opacity = false;
        let vbuffer = this.vdo.verticesData.buffer;
        let fbuffer = this.vdo.fragmentData.buffer;
        let ibuffer = this.vdo.indexData.dataArray;
        if (opacity) {
            vbuffer = this.vdo.opacityVerticesData.buffer;
            fbuffer = this.vdo.opacityFragmentData.buffer;
            ibuffer = this.vdo.opacityIndexData.dataArray;
        }
        let gl = this.gl;
        let shaderInfo = this.shaderInformation;
        gl.enableVertexAttribArray(shaderInfo.vertexAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.verticesBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, this.verticesData.buffer, gl.DYNAMIC_DRAW);
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
        gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.fragmentBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, this.fragmentData.buffer, gl.DYNAMIC_DRAW);
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

        // calculateDataProperty:
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shaderInfo.indexDataBuffer);
        // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexData.dataArray, gl.DYNAMIC_DRAW);
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
        this.prepareWebGLBuffer(true);
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
        this.gl.uniform3f(this.shaderInformation.lightPosition, this.lightPosition[0], this.lightPosition[1], this.lightPosition[2]);
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
        if (this.projectionType == 0) {
            m1 = Mat4.orthoProjection(0, 0, gl.canvas.width, gl.canvas.height, near, Math.abs(this.defaultDepth * 2), this.orthoProjectionMatrix);
        } else {
            this.initLookAtTarget(this.defaultDepth);
            m1 = Mat4.perspective3(halfFOVRadian * 2, gl.canvas.width, gl.canvas.height, near, Math.abs(this.defaultDepth * 10), this.perspectiveMatrix);
            let cm = Mat4.lookAt(this.cameraPosition, this.lookTarget);
            Mat4.inverse(cm, cm);
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
        }
        gl.uniform2f(shaderInfo.singleCanvas, c.width, c.height);
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);
    }

    createShaderProgram() {
        let gl = this.gl;
        const vertexShader = this.loadShader(gl.VERTEX_SHADER, this.getVertexShaderSource(this.maxTransformMatrixNum));
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

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
        this.textureManager = new TextureManager(801, gl, 10, 4);
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
        let enableLight = gl.getUniformLocation(program, "enableLight");
        let textureLocation = gl.getUniformLocation(program, "u_texture");
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

    /**

     这样我看得更清楚些

     attribute vec4 color;
     attribute vec4 a_position;
     attribute vec2 u_texCoord;
     attribute vec2 transform_matrix_index;
     varying vec2 v_texcoord;
     varying vec4 currentColor;
     uniform mat4 texture_matrix;
     uniform mat4 perspective_matrix;
     uniform mat4 transform_matrix_array[transformMatrixCount];
     void main() {
            // v_texcoord = u_texCoord;
            vec4 new_position = transform_matrix_array[0] * a_position;
            vec4 finalPosition = perspective_matrix* new_position;
            currentColor = vec4 (color.xyz/255.0,color.w/100.0);
            gl_Position = finalPosition;
    };

     * @param transformMatrixCount
     * @returns {string}
     */
    getVertexShaderSource(transformMatrixCount) {
        let vsSource = ' attribute vec3 color;\n' +
            '     attribute vec4 a_position;\n' +
            '     attribute vec3 a_normal;\n' +
            '     attribute float alpha;\n' +
            '     attribute vec2 u_texCoord;\n' +
            '     attribute float u_filterType;\n' +
            '     varying vec3 v_position;\n' +
            '     varying float v_filterType;\n' +
            '     attribute float transform_matrix_index;\n' +
            '     varying vec2 v_texcoord;\n' +
            '     varying vec4 currentColor;\n' +
            '     varying vec3 normal;\n' +
            '     uniform mat4 perspective_matrix;\n' +
            '     uniform mat4 transform_matrix_array[' + transformMatrixCount + '];\n' +
            '     void main() {\n' +
            '            normal = a_normal;\n' +
            '            float ft = u_filterType;\n' +
            '            v_filterType = u_filterType + 0.5;\n' +
            '            vec4 yuandian = vec4(0,0,0,1);\n' +
            '            v_texcoord = u_texCoord;\n' +
            '            vec4 new_position = transform_matrix_array[0] * a_position;\n' +
            '            v_position = vec3(new_position.xyz);\n' +
            '            vec4 finalPosition = perspective_matrix* new_position;\n' +
            '            currentColor = vec4 (color.xyz/255.0,alpha);\n' +
            '            gl_Position = finalPosition;\n' +
            '    }';
        return vsSource;
    }
}