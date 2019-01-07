import TextureManager from "./TextureManager.js";
import RenderAction from "./RenderAction.js";
import Mat4 from "../math/Mat4.js";

const SINGLE_DATA_BYTE_LENGTH = 32;
let fsSource = `
  // 片断着色器没有默认精度，所以我们需要设置一个精度
  // mediump代表“medium precision”（中等精度）
  precision mediump float;
  varying vec4 currentColor;
  varying vec2 v_texcoord;
  varying vec3 normal;
  uniform vec2 singleCanvas;
  uniform sampler2D u_texture;
  void main() {
        vec2 coord = vec2(v_texcoord.x / singleCanvas.x , v_texcoord.y/singleCanvas.y);
        vec4 color = currentColor;    
        vec3 lightLocation = vec3(0.5,0.7,1);    
        gl_FragColor = color * texture2D(u_texture,coord);
        gl_FragColor.rgb *= abs(dot(normal,lightLocation));
  }
  `;
/**
 // 片断着色器没有默认精度，所以我们需要设置一个精度
 // mediump代表“medium precision”（中等精度）
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
    constructor(gl) {
        this.gl = gl;
        this.firstTIMEDEBUG = true;
        this.DEBUG_DRAW_COUNT = 0;
        this.configured = false;
        let maxVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        // 顶点作色器里已经用了一个mat4了，就是4个vector,减去这4个然后除以4就得到可以定义的最大mat4数组
        this[_maxTransformMatrixNum] = Math.floor((maxVectors - 4) / 4);
        this[_maxTransformMatrixNum] = 10; // 测试设置
        this.textureManager = null;
        this.init();
    }

    get maxTransformMatrixNum() {
        return this[_maxTransformMatrixNum];
    }

    clean() {
        this.DEBUG_DRAW_COUNT = 0;
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    initRending() {
        let gl = this.gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }

    rendVertexArray(type, vertexDataArray, firstVerticesStart, lastVerticesEnd, textureIndex) {
        let gl = this.gl;
        switch (type) {
            case RenderAction.ACTION_FILL :
                this.fillRendVertexArray(vertexDataArray, firstVerticesStart, lastVerticesEnd, textureIndex);
                break;
            case RenderAction.ACTION_STROKE:
                this.strokeRendVertexArray(vertexDataArray, firstVerticesStart, lastVerticesEnd, textureIndex);
                break;
        }
    }

    setUniformTransformMatrix(matrix, id) {
        let gl = this.gl;
        gl.uniformMatrix4fv(this.shaderInformation.transformMatrixArray[id], false, matrix);
    }


    configVerticesBufferData(vertexDataArray, firstVerticesStart, lastVerticesEnd) {
        let size = 0;
        let vertexNumber = 0;
        if (firstVerticesStart == undefined) firstVerticesStart = 0;
        for (let i = 0; i < vertexDataArray.length; i++) {
            size += vertexDataArray[i].bufferSize;
            if (i == vertexDataArray.length - 1 && lastVerticesEnd != undefined) {
                vertexNumber += lastVerticesEnd + 1;
            } else {
                vertexNumber += vertexDataArray[i].vertexNumber;
            }
        }
        vertexNumber -= firstVerticesStart;
        let gl = this.gl;
        this.prepareVertexDatas(size);
        this.prepareMatrixIndexDatas(size / 8);//因为单个顶点的大小为32，矩阵索引是4，所以就是8倍的关系

        let offset = 0;
        let offset1 = 0;
        for (let i = 0; i < vertexDataArray.length; i++) {
            let vertexData = vertexDataArray[i];
            gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderInformation.verticesBuffer);
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, offset, vertexData.dataBuffer.buffer);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderInformation.matrixIndexBuffer);
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, offset1, vertexData.matrixIndexBuffer.buffer);
            offset += vertexData.dataBuffer.currentIndex;
            offset1 += vertexData.matrixIndexBuffer.currentIndex;
        }
        return vertexNumber;
    }

    fillRendVertexArray(vertexDataArray, firstVerticesStart, lastVerticesEnd, textureIndex) {
        if (firstVerticesStart == undefined) firstVerticesStart = 0;
        if (vertexDataArray.length == 0) return;
        this.configTexture(textureIndex);
        let vertexNumber = this.configVerticesBufferData(vertexDataArray, firstVerticesStart, lastVerticesEnd);
        if (vertexNumber < 3) return;
        this.gl.drawArrays(this.gl.TRIANGLES, 0, vertexNumber);
        this.DEBUG_DRAW_COUNT++;
    }

    strokeRendVertexArray(vertexDataArray, firstVerticesStart, lastVerticesEnd) {
        if (firstVerticesStart == undefined) firstVerticesStart = 0;
        if (vertexDataArray.length == 0) return;
        this.configTexture();
        let vertexNumber = this.configVerticesBufferData(vertexDataArray, firstVerticesStart, lastVerticesEnd);
        if (vertexNumber < 2) return;
        this.gl.drawArrays(this.gl.LINE_STRIP, 0, vertexNumber);
        this.DEBUG_DRAW_COUNT++;
    }

    executeRenderAction(actionList, stateArray) {
        let matrixIndex = 1; // 每次绘制都要重新设置矩阵的索引
        let lastAction = undefined;
        let vertexDataArray = [];
        let matrixMap = {}; // 由状态id和状态内矩阵id组合成一个key，value是对应的矩阵索引值
        let firstVerticesStart = 0;


        for (let i = 0; i < actionList.length; i++) {
            let currentAction = actionList[i];
            if (lastAction == undefined) lastAction = currentAction;
            if (currentAction.type == RenderAction.ACTION_STROKE) {
                if (lastAction != currentAction && lastAction != undefined) {
                    this.rendVertexArray(lastAction.type, vertexDataArray, undefined, undefined, lastAction.textureIndex);
                }
                vertexDataArray.length = 0;
                vertexDataArray.push(currentAction.vertexData);
                matrixIndex = 1;
                matrixMap = {};
                lastAction = currentAction;
                for (let k = 0; k < currentAction.vertexData.vertexNumber; k++) {
                    let mid = currentAction.vertexData.getMatrixIndex(k);
                    let sid = currentAction.vertexData.getContextStateIndex(k);
                    let key = sid.toString() + '-' + mid.toString();
                    let currentMatrixIndex = matrixMap[key];
                    if (currentMatrixIndex == undefined) {
                        currentMatrixIndex = matrixIndex;
                        if ((currentMatrixIndex + 1) > this.maxTransformMatrixNum) {
                            //为了能让一个绘制动作顺利结束，只能自己计算坐标咯
                            let m = stateArray[sid].matrixArray[mid];
                            let vertex = currentAction.vertexData.dataBuffer.getVertex(k * currentAction.vertexData.dataBuffer.singleDataFragmentByteSize);
                            vertex = Mat4.multiplyWithVertex(m, vertex);
                            currentAction.vertexData.dataBuffer.modifyVertex(vertex, k * currentAction.vertexData.dataBuffer.singleDataFragmentByteSize);
                            currentAction.vertexData.matrixIndexBuffer.put(0);
                        } else {
                            let m = stateArray[sid].matrixArray[mid];
                            matrixMap[key] = currentMatrixIndex;
                            this.setUniformTransformMatrix(m, currentMatrixIndex);
                            currentAction.vertexData.matrixIndexBuffer.put(currentMatrixIndex);
                            matrixIndex++;
                        }
                    } else {
                        currentAction.vertexData.matrixIndexBuffer.put(currentMatrixIndex);
                    }
                }
                this.rendVertexArray(currentAction.type, vertexDataArray);
                matrixMap = {};
                vertexDataArray.length = 0;
                matrixIndex = 1;
                continue;
            } else {
                // 先收集顶点数据，顶点的矩阵在下一步再设置
                if (currentAction.type == lastAction.type) { // 同个Fill绘制可以进行叠加统一绘制
                    if (currentAction.textureIndex != lastAction.textureIndex && currentAction.textureIndex != -1 && lastAction.textureIndex != -1) {
                        this.rendVertexArray(lastAction.type, vertexDataArray, undefined, undefined, lastAction.textureIndex);
                        vertexDataArray.length = 0;
                        lastAction = currentAction;
                        matrixIndex = 1;
                        matrixMap = {};
                    }
                    if (lastAction.textureIndex == -1 && currentAction.textureIndex != -1) {
                        lastAction = currentAction;
                    }
                    vertexDataArray.push(currentAction.vertexData); // 叠加
                } else {
                    // 如果类型不一样，先绘制之前的类型，并且当前的index退回去
                    this.rendVertexArray(lastAction.type, vertexDataArray);
                    matrixIndex = 1;
                    i--;
                    lastAction = undefined;
                    vertexDataArray.length = 0;
                    continue;
                }
            }

            // 开始设置顶点的变换矩阵
            for (let k = 0; k < currentAction.vertexData.vertexNumber; k++) {
                let mid = currentAction.vertexData.getMatrixIndex(k);
                let sid = currentAction.vertexData.getContextStateIndex(k);
                let key = sid.toString() + '-' + mid.toString();
                let currentMatrixIndex = matrixMap[key];
                if (currentMatrixIndex == undefined) {
                    currentMatrixIndex = matrixIndex;
                    if ((currentMatrixIndex + 1) > this.maxTransformMatrixNum) {
                        // 如果Index已经超过最大限制，就先绘制之前的
                        if (k == 0) {
                            vertexDataArray.pop();
                            this.rendVertexArray(lastAction.type, vertexDataArray, undefined, undefined, lastAction.textureIndex);
                            matrixMap = {};
                            matrixIndex = 1;
                            vertexDataArray.length = 0;
                            lastAction = undefined;
                            i--;
                            break;
                        } else {
                            //为了能让一个绘制动作顺利结束，只能自己计算坐标咯
                            let m = stateArray[sid].matrixArray[mid];
                            let vertex = currentAction.vertexData.dataBuffer.getVertex(k * currentAction.vertexData.dataBuffer.singleDataFragmentByteSize);
                            vertex = Mat4.multiplyWithVertex(m, vertex);
                            currentAction.vertexData.dataBuffer.modifyVertex(vertex, k * currentAction.vertexData.dataBuffer.singleDataFragmentByteSize);
                            currentAction.vertexData.matrixIndexBuffer.put(0);
                        }
                    } else {
                        let m = stateArray[sid].matrixArray[mid];
                        matrixMap[key] = currentMatrixIndex;
                        this.setUniformTransformMatrix(m, currentMatrixIndex);
                        currentAction.vertexData.matrixIndexBuffer.put(currentMatrixIndex);
                        matrixIndex++;
                    }
                } else {
                    currentAction.vertexData.matrixIndexBuffer.put(currentMatrixIndex);
                }
            }
        }

        if (vertexDataArray.length != 0 && lastAction != undefined) {
            this.rendVertexArray(lastAction.type, vertexDataArray, firstVerticesStart, undefined, lastAction.textureIndex);
        }
    }

    configTexture(textureIndex) {
        if (textureIndex == undefined) textureIndex = -1;
        let gl = this.gl;
        let shaderInfo = this.shaderInformation;
        gl.uniform1i(shaderInfo.textureLocation, 0);
        let texture;
        let c;
        if (textureIndex == -1) {
            texture = shaderInfo.blackTexture;
            c = {width: 1, height: 1};
        } else {
            texture = this.textureManager.textureArray[textureIndex];
            c = this.textureManager.imageDataArray[textureIndex];
        }
        gl.uniform2f(shaderInfo.singleCanvas, c.width, c.height);
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }

    prepareVertexDatas(dataByteLength) {
        let gl = this.gl;
        let shaderInfo = this.shaderInformation;
        gl.enableVertexAttribArray(shaderInfo.vertexAttribute);
        gl.enableVertexAttribArray(shaderInfo.colorAttribute);
        gl.enableVertexAttribArray(shaderInfo.textureCoordAttribute);
        // gl.enableVertexAttribArray(shaderInfo.transformMatrixIndex);
        gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, dataByteLength, gl.DYNAMIC_DRAW);

        // 设置如何从buffer中读出顶点
        let floatByteSize = 4;

        // 设置如何从buffer中读出顶点
        let size = 3;          // 这是表示这组数据由多少个数组element组成
        let type = gl.FLOAT;   // 给出数据的类型
        let normalize = false; // 是否要标准化，比如gl.UNSIGN8BIT,就会变成[1-0】之间的数字
        let stride = SINGLE_DATA_BYTE_LENGTH;       // 读取的时候移动多少字节到达该类型数据的下一个，这个很关键，一般都是这个数据layout的单个组成所有数据的大小
        // 比如现在，就是3个顶点坐标+2个贴图坐标+2个无用float，因为都设置成了float，再加上4位颜色 所以这个stride值就是 7*4+4 =32;
        let offset = 0;        // 读取的起始位置，和stride一样，移动的位置也是字节大小。顶点数据是在整个layout的开始，所以是0，而颜色数据在顶点之后，则是3*4
        gl.vertexAttribPointer(
            shaderInfo.vertexAttribute, size, type, normalize, stride, offset);

        // type = gl.FLOAT;
        // size = 1;
        // offset = 3 * floatByteSize;
        // gl.vertexAttribPointer(shaderInfo.transformMatrixIndex, size, type, normalize, stride, offset);

        type = gl.UNSIGNED_BYTE;
        size = 4;
        offset = 5 * floatByteSize; // 注意：这里要跳过两个无用的float类型数据
        gl.vertexAttribPointer(shaderInfo.colorAttribute, size, type, normalize, stride, offset);

        type = gl.FLOAT;
        size = 2;
        offset += 4;
        gl.vertexAttribPointer(
            shaderInfo.textureCoordAttribute, size, type, normalize, stride, offset);
    }

    prepareMatrixIndexDatas(length) {
        let gl = this.gl;
        let shaderInfo = this.shaderInformation;

        gl.enableVertexAttribArray(shaderInfo.transformMatrixIndex);
        gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.matrixIndexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, length, gl.DYNAMIC_DRAW);
        let type = gl.FLOAT;
        let size = 1;
        let offset = 0;
        let stripe = 4;
        gl.vertexAttribPointer(shaderInfo.transformMatrixIndex, size, type, false, stripe, offset);
    }

    registerTexture(image) {

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
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.BLEND);
        this.gl.disable(this.gl.DEPTH_TEST);
        this[_program] = this.createShaderProgram();
        let program = this[_program];
        this.shaderInformation = this.initShaderInformation(program);
        this.textureManager = new TextureManager(801, 801, 10, 4);
        // this.textureManager.maxHeight = gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
        // this.textureManager.maxWidth = this.textureManager.maxHeight;
        // 设置透视矩阵
        let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        // let m2 = MyMat4.perspective(60 * Math.PI / 180, aspect, 1, 2000);
        let m1 = Mat4.projection(gl.canvas.width, gl.canvas.height, 2000);
        m1 = Mat4.orthoProjection(0, 0, gl.canvas.width, gl.canvas.height, -1000, 1000);
        // m1 = Mat4.perspective(60 * Math.PI / 180, aspect, 1, 100)
        // let test = [0,0,-90,1];
        // test = Mat4.multiplyWithVertex(m1,test);
        // console.log(test[0]/test[3],test[1]/test[3],test[2]/test[3]);
        //
        // test = [100,0,-90,1];
        // test = Mat4.multiplyWithVertex(m1,test);
        // console.log(test[0]/test[3],test[1]/test[3],test[2]/test[3]);
        //
        // test = [100,100,-90,1];
        // test = Mat4.multiplyWithVertex(m1,test);
        // console.log(test[0]/test[3],test[1]/test[3],test[2]/test[3]);
        //
        // test = [0,100,-90,1];
        // test = Mat4.multiplyWithVertex(m1,test);
        // console.log(test[0]/test[3],test[1]/test[3],test[2]/test[3]);
        // if (this.perspectiveType == PERSPECTIVE) {
        //     // 如果是透视类型就设置透视矩阵(3d)
        //     gl.uniformMatrix4fv(this.shaderInformation.perspectiveMatrix, false, m2);
        // }
        // if (this.perspectiveType == PROJECTION) {
        // 如果是投影类型就设置投影矩阵 (2d)
        gl.uniformMatrix4fv(this.shaderInformation.perspectiveMatrix, false, m1);
        // }
    }

    initShaderInformation(program) {
        let gl = this.gl;

        let textureCoordAttribute = gl.getAttribLocation(program, "u_texCoord");
        gl.enableVertexAttribArray(textureCoordAttribute);

        let vertexAttribute = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(vertexAttribute);

        let transformMatrixIndex = gl.getAttribLocation(program, "transform_matrix_index");
        gl.enableVertexAttribArray(transformMatrixIndex);

        let colorAttribute = gl.getAttribLocation(program, 'color');
        gl.enableVertexAttribArray(colorAttribute);


        // 转化矩阵全局变量
        let perspectiveMatrix = gl.getUniformLocation(program, "perspective_matrix");
        let transformMatrixArray = new Array(this.maxTransformMatrixNum);
        for (let i = 0; i < transformMatrixArray.length; i++) {
            transformMatrixArray[i] = gl.getUniformLocation(program, "transform_matrix_array[" + i + "]");
        }
        gl.uniformMatrix4fv(transformMatrixArray[0], false, Mat4.identity());
        let singleCanvas = gl.getUniformLocation(program, "singleCanvas");
        let textureLocation = gl.getUniformLocation(program, "u_texture");

        // 创建数据缓存
        let verticesBuffer = gl.createBuffer();
        let matrixIndexBuffer = gl.createBuffer();
        let blackTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, blackTexture);
        let blackPixel = new Uint8Array([255, 255, 255, 255]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blackPixel);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return {
            vertexAttribute: vertexAttribute,
            colorAttribute: colorAttribute,
            textureCoordAttribute: textureCoordAttribute,
            verticesBuffer: verticesBuffer,
            matrixIndexBuffer: matrixIndexBuffer,
            perspectiveMatrix: perspectiveMatrix,
            transformMatrixArray: transformMatrixArray,
            transformMatrixIndex: transformMatrixIndex,
            singleCanvas: singleCanvas,
            textureLocation: textureLocation,
            blackTexture: blackTexture,
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
            // 切换坐标系到投影坐标系中
            vec4 new_position = transform_matrix_array[0] * a_position;
            vec4 finalPosition = perspective_matrix* new_position;
            currentColor = vec4 (color.xyz/255.0,color.w/100.0);
            gl_Position = finalPosition;
    };

     * @param transformMatrixCount
     * @returns {string}
     */
    getVertexShaderSource(transformMatrixCount) {
        let vsSource = ' attribute vec4 color;\n' +
            '     attribute vec4 a_position;\n' +
            '     attribute vec2 u_texCoord;\n' +
            '     attribute float transform_matrix_index;\n' +
            '     varying vec2 v_texcoord;\n' +
            '     varying vec4 currentColor;\n' +
            '     varying vec3 normal;\n' +
            '     uniform mat4 perspective_matrix;\n' +
            '     uniform mat4 transform_matrix_array[' + transformMatrixCount + '];\n' +
            '     void main() {\n' +
            '             normal = vec3(0,0,1);\n' +
            '             v_texcoord = u_texCoord;\n' +
            '            // 切换坐标系到投影坐标系中\n' +
            '            vec4 new_position = transform_matrix_array[int(transform_matrix_index)] * a_position;\n' +
            '            normal = mat3(transform_matrix_array[int(transform_matrix_index)]) * normal;\n' +
            '            vec4 finalPosition = perspective_matrix* new_position;\n' +
            '            currentColor = vec4 (color.xyz/255.0,color.w/100.0);\n' +
            '            gl_Position = finalPosition;\n' +
            '    }';
        return vsSource;
    }
}