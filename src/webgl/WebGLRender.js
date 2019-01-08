"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TextureManager = require("./TextureManager.js");

var _TextureManager2 = _interopRequireDefault(_TextureManager);

var _RenderAction = require("./RenderAction.js");

var _RenderAction2 = _interopRequireDefault(_RenderAction);

var _Mat = require("../math/Mat4.js");

var _Mat2 = _interopRequireDefault(_Mat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SINGLE_DATA_BYTE_LENGTH = 32;
var fsSource = "\n  // \u7247\u65AD\u7740\u8272\u5668\u6CA1\u6709\u9ED8\u8BA4\u7CBE\u5EA6\uFF0C\u6240\u4EE5\u6211\u4EEC\u9700\u8981\u8BBE\u7F6E\u4E00\u4E2A\u7CBE\u5EA6\n  // mediump\u4EE3\u8868\u201Cmedium precision\u201D\uFF08\u4E2D\u7B49\u7CBE\u5EA6\uFF09\n  precision mediump float;\n  varying vec4 currentColor;\n  varying vec2 v_texcoord;\n  varying vec3 normal;\n  uniform vec2 singleCanvas;\n  uniform vec3 u_lightPosition;\n  uniform sampler2D u_texture;\n  void main() {\n        vec2 coord = vec2(v_texcoord.x / singleCanvas.x , v_texcoord.y/singleCanvas.y);\n        vec4 color = currentColor;\n        vec3 r_normal = normalize(normal);    \n        vec3 lightLocation = normalize(u_lightPosition);    \n        gl_FragColor = color * texture2D(u_texture,coord);\n        gl_FragColor.rgb *= abs(dot(r_normal,u_lightPosition));\n  }\n  ";
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

var _program = Symbol('WebGL的program');
var _maxTransformMatrixNum = Symbol('转换矩阵变量可用的最大数量');

var WebGLRender = function () {
    function WebGLRender(gl) {
        _classCallCheck(this, WebGLRender);

        this.gl = gl;
        this.firstTIMEDEBUG = true;
        this.DEBUG_DRAW_COUNT = 0;
        this.configured = false;
        var maxVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        // 顶点作色器里已经用了一个mat4了，就是4个vector,减去这4个然后除以4就得到可以定义的最大mat4数组
        this[_maxTransformMatrixNum] = Math.floor((maxVectors - 4) / 4);
        this[_maxTransformMatrixNum] = 10; // 测试设置
        this.textureManager = null;
        this.lightPosition = new Float32Array(3);
        this.lightPosition[0] = 0;
        this.lightPosition[1] = 0;
        this.lightPosition[2] = 1;
        this.init();
    }

    _createClass(WebGLRender, [{
        key: "clean",
        value: function clean() {
            this.DEBUG_DRAW_COUNT = 0;
            this.gl.clearColor(0, 0, 0, 0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        }
    }, {
        key: "initRending",
        value: function initRending() {
            var gl = this.gl;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }
    }, {
        key: "rendVertexArray",
        value: function rendVertexArray(type, vertexDataArray, firstVerticesStart, lastVerticesEnd, textureIndex) {
            var gl = this.gl;
            this.gl.uniform3f(this.shaderInformation.lightPosition, this.lightPosition[0], this.lightPosition[1], this.lightPosition[2]);
            switch (type) {
                case _RenderAction2.default.ACTION_FILL:
                    this.fillRendVertexArray(vertexDataArray, firstVerticesStart, lastVerticesEnd, textureIndex);
                    break;
                case _RenderAction2.default.ACTION_STROKE:
                    this.strokeRendVertexArray(vertexDataArray, firstVerticesStart, lastVerticesEnd, textureIndex);
                    break;
            }
        }
    }, {
        key: "setUniformTransformMatrix",
        value: function setUniformTransformMatrix(matrix, id) {
            var gl = this.gl;
            gl.uniformMatrix4fv(this.shaderInformation.transformMatrixArray[id], false, matrix);
        }
    }, {
        key: "configVerticesBufferData",
        value: function configVerticesBufferData(vertexDataArray, firstVerticesStart, lastVerticesEnd) {
            var size = 0;
            var vertexNumber = 0;
            if (firstVerticesStart == undefined) firstVerticesStart = 0;
            for (var i = 0; i < vertexDataArray.length; i++) {
                size += vertexDataArray[i].bufferSize;
                if (i == vertexDataArray.length - 1 && lastVerticesEnd != undefined) {
                    vertexNumber += lastVerticesEnd + 1;
                } else {
                    vertexNumber += vertexDataArray[i].vertexNumber;
                }
            }
            vertexNumber -= firstVerticesStart;
            var gl = this.gl;
            this.prepareVertexDatas(size);
            this.prepareMatrixIndexDatas(size / 8); //因为单个顶点的大小为32，矩阵索引是4，所以就是8倍的关系

            var offset = 0;
            var offset1 = 0;
            for (var _i = 0; _i < vertexDataArray.length; _i++) {
                var vertexData = vertexDataArray[_i];
                gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderInformation.verticesBuffer);
                this.gl.bufferSubData(this.gl.ARRAY_BUFFER, offset, vertexData.dataBuffer.buffer);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderInformation.matrixIndexBuffer);
                this.gl.bufferSubData(this.gl.ARRAY_BUFFER, offset1, vertexData.matrixIndexBuffer.buffer);
                offset += vertexData.dataBuffer.currentIndex;
                offset1 += vertexData.matrixIndexBuffer.currentIndex;
            }
            return vertexNumber;
        }
    }, {
        key: "fillRendVertexArray",
        value: function fillRendVertexArray(vertexDataArray, firstVerticesStart, lastVerticesEnd, textureIndex) {
            if (firstVerticesStart == undefined) firstVerticesStart = 0;
            if (vertexDataArray.length == 0) return;
            this.configTexture(textureIndex);
            var vertexNumber = this.configVerticesBufferData(vertexDataArray, firstVerticesStart, lastVerticesEnd);
            if (vertexNumber < 3) return;
            this.gl.drawArrays(this.gl.TRIANGLES, 0, vertexNumber);
            this.DEBUG_DRAW_COUNT++;
        }
    }, {
        key: "strokeRendVertexArray",
        value: function strokeRendVertexArray(vertexDataArray, firstVerticesStart, lastVerticesEnd) {
            if (firstVerticesStart == undefined) firstVerticesStart = 0;
            if (vertexDataArray.length == 0) return;
            this.configTexture();
            var vertexNumber = this.configVerticesBufferData(vertexDataArray, firstVerticesStart, lastVerticesEnd);
            if (vertexNumber < 2) return;
            this.gl.drawArrays(this.gl.LINE_STRIP, 0, vertexNumber);
            this.DEBUG_DRAW_COUNT++;
        }
    }, {
        key: "executeRenderAction",
        value: function executeRenderAction(actionList, stateArray) {
            var matrixIndex = 1; // 每次绘制都要重新设置矩阵的索引
            var lastAction = undefined;
            var vertexDataArray = [];
            var matrixMap = {}; // 由状态id和状态内矩阵id组合成一个key，value是对应的矩阵索引值
            var firstVerticesStart = 0;

            for (var i = 0; i < actionList.length; i++) {
                var currentAction = actionList[i];
                if (lastAction == undefined) lastAction = currentAction;
                if (currentAction.type == _RenderAction2.default.ACTION_STROKE) {
                    if (lastAction != currentAction && lastAction != undefined) {
                        this.rendVertexArray(lastAction.type, vertexDataArray, undefined, undefined, lastAction.textureIndex);
                    }
                    vertexDataArray = [];
                    vertexDataArray.push(currentAction.vertexData);
                    matrixIndex = 1;
                    matrixMap = {};
                    lastAction = currentAction;
                    for (var k = 0; k < currentAction.vertexData.vertexNumber; k++) {
                        var mid = currentAction.vertexData.getMatrixIndex(k);
                        var sid = currentAction.vertexData.getContextStateIndex(k);
                        var key = sid.toString() + '-' + mid.toString();
                        var currentMatrixIndex = matrixMap[key];
                        if (currentMatrixIndex == undefined) {
                            currentMatrixIndex = matrixIndex;
                            if (currentMatrixIndex + 1 > this.maxTransformMatrixNum) {
                                //为了能让一个绘制动作顺利结束，只能自己计算坐标咯
                                var m = stateArray[sid].matrixArray[mid];
                                var vertex = currentAction.vertexData.dataBuffer.getVertex(k * currentAction.vertexData.dataBuffer.singleDataFragmentByteSize);
                                vertex = _Mat2.default.multiplyWithVertex(m, vertex);
                                currentAction.vertexData.dataBuffer.modifyVertex(vertex, k * currentAction.vertexData.dataBuffer.singleDataFragmentByteSize);
                                currentAction.vertexData.matrixIndexBuffer.put(0);
                            } else {
                                var _m = stateArray[sid].matrixArray[mid];
                                matrixMap[key] = currentMatrixIndex;
                                this.setUniformTransformMatrix(_m, currentMatrixIndex);
                                currentAction.vertexData.matrixIndexBuffer.put(currentMatrixIndex);
                                matrixIndex++;
                            }
                        } else {
                            currentAction.vertexData.matrixIndexBuffer.put(currentMatrixIndex);
                        }
                    }
                    this.rendVertexArray(currentAction.type, vertexDataArray);
                    matrixMap = {};
                    vertexDataArray = [];
                    matrixIndex = 1;
                    continue;
                } else {
                    // 先收集顶点数据，顶点的矩阵在下一步再设置
                    if (currentAction.type == lastAction.type) {
                        // 同个Fill绘制可以进行叠加统一绘制
                        if (currentAction.textureIndex != lastAction.textureIndex && currentAction.textureIndex != -1 && lastAction.textureIndex != -1) {
                            this.rendVertexArray(lastAction.type, vertexDataArray, undefined, undefined, lastAction.textureIndex);
                            vertexDataArray = [];
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
                        vertexDataArray = [];
                        continue;
                    }
                }

                // 开始设置顶点的变换矩阵
                for (var _k = 0; _k < currentAction.vertexData.vertexNumber; _k++) {
                    var _mid = currentAction.vertexData.getMatrixIndex(_k);
                    var _sid = currentAction.vertexData.getContextStateIndex(_k);
                    var _key = _sid.toString() + '-' + _mid.toString();
                    var _currentMatrixIndex = matrixMap[_key];
                    if (_currentMatrixIndex == undefined) {
                        _currentMatrixIndex = matrixIndex;
                        if (_currentMatrixIndex + 1 > this.maxTransformMatrixNum) {
                            // 如果Index已经超过最大限制，就先绘制之前的
                            if (_k == 0) {
                                vertexDataArray.pop();
                                this.rendVertexArray(lastAction.type, vertexDataArray, undefined, undefined, lastAction.textureIndex);
                                matrixMap = {};
                                matrixIndex = 1;
                                vertexDataArray = [];
                                lastAction = undefined;
                                i--;
                                break;
                            } else {
                                //为了能让一个绘制动作顺利结束，只能自己计算坐标咯
                                var _m2 = stateArray[_sid].matrixArray[_mid];
                                var _vertex = currentAction.vertexData.dataBuffer.getVertex(_k * currentAction.vertexData.dataBuffer.singleDataFragmentByteSize);
                                _vertex = _Mat2.default.multiplyWithVertex(_m2, _vertex);
                                currentAction.vertexData.dataBuffer.modifyVertex(_vertex, _k * currentAction.vertexData.dataBuffer.singleDataFragmentByteSize);
                                currentAction.vertexData.matrixIndexBuffer.put(0);
                            }
                        } else {
                            var _m3 = stateArray[_sid].matrixArray[_mid];
                            matrixMap[_key] = _currentMatrixIndex;
                            this.setUniformTransformMatrix(_m3, _currentMatrixIndex);
                            currentAction.vertexData.matrixIndexBuffer.put(_currentMatrixIndex);
                            matrixIndex++;
                        }
                    } else {
                        currentAction.vertexData.matrixIndexBuffer.put(_currentMatrixIndex);
                    }
                }
            }

            if (vertexDataArray.length != 0 && lastAction != undefined) {
                this.rendVertexArray(lastAction.type, vertexDataArray, firstVerticesStart, undefined, lastAction.textureIndex);
            }
        }
    }, {
        key: "setLightPosition",
        value: function setLightPosition(x, y, z) {
            this.lightPosition[0] = x;
            this.lightPosition[1] = y;
            this.lightPosition[2] = z;
        }
    }, {
        key: "configTexture",
        value: function configTexture(textureIndex) {
            if (textureIndex == undefined) textureIndex = -1;
            var gl = this.gl;
            var shaderInfo = this.shaderInformation;
            gl.uniform1i(shaderInfo.textureLocation, 0);
            var texture = void 0;
            var c = void 0;
            if (textureIndex == -1) {
                texture = shaderInfo.blackTexture;
                c = { width: 1, height: 1 };
            } else {
                texture = this.textureManager.textureArray[textureIndex];
                c = this.textureManager.imageDataArray[textureIndex];
            }
            gl.uniform2f(shaderInfo.singleCanvas, c.width, c.height);
            gl.activeTexture(gl.TEXTURE0 + 0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
        }
    }, {
        key: "prepareVertexDatas",
        value: function prepareVertexDatas(dataByteLength) {
            var gl = this.gl;
            var shaderInfo = this.shaderInformation;
            gl.enableVertexAttribArray(shaderInfo.vertexAttribute);
            gl.enableVertexAttribArray(shaderInfo.colorAttribute);
            gl.enableVertexAttribArray(shaderInfo.textureCoordAttribute);
            // gl.enableVertexAttribArray(shaderInfo.transformMatrixIndex);
            gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.verticesBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, dataByteLength, gl.DYNAMIC_DRAW);

            // 设置如何从buffer中读出顶点
            var floatByteSize = 4;

            // 设置如何从buffer中读出顶点
            var size = 3; // 这是表示这组数据由多少个数组element组成
            var type = gl.FLOAT; // 给出数据的类型
            var normalize = false; // 是否要标准化，比如gl.UNSIGN8BIT,就会变成[1-0】之间的数字
            var stride = SINGLE_DATA_BYTE_LENGTH; // 读取的时候移动多少字节到达该类型数据的下一个，这个很关键，一般都是这个数据layout的单个组成所有数据的大小
            // 比如现在，就是3个顶点坐标+2个贴图坐标+2个无用float，因为都设置成了float，再加上4位颜色 所以这个stride值就是 7*4+4 =32;
            var offset = 0; // 读取的起始位置，和stride一样，移动的位置也是字节大小。顶点数据是在整个layout的开始，所以是0，而颜色数据在顶点之后，则是3*4
            gl.vertexAttribPointer(shaderInfo.vertexAttribute, size, type, normalize, stride, offset);

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
            gl.vertexAttribPointer(shaderInfo.textureCoordAttribute, size, type, normalize, stride, offset);
        }
    }, {
        key: "prepareMatrixIndexDatas",
        value: function prepareMatrixIndexDatas(length) {
            var gl = this.gl;
            var shaderInfo = this.shaderInformation;

            gl.enableVertexAttribArray(shaderInfo.transformMatrixIndex);
            gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.matrixIndexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, length, gl.DYNAMIC_DRAW);
            var type = gl.FLOAT;
            var size = 1;
            var offset = 0;
            var stripe = 4;
            gl.vertexAttribPointer(shaderInfo.transformMatrixIndex, size, type, false, stripe, offset);
        }
    }, {
        key: "registerTexture",
        value: function registerTexture(image) {}
    }, {
        key: "createShaderProgram",
        value: function createShaderProgram() {
            var gl = this.gl;
            var vertexShader = this.loadShader(gl.VERTEX_SHADER, this.getVertexShaderSource(this.maxTransformMatrixNum));
            var fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

            // 创建Shader程序，一个是顶点shader一个是片段shader
            var shaderProgram = gl.createProgram();
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
    }, {
        key: "init",
        value: function init() {
            var gl = this.gl;
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
            this.gl.enable(this.gl.BLEND);
            this.gl.disable(this.gl.DEPTH_TEST);
            this[_program] = this.createShaderProgram();
            var program = this[_program];
            this.shaderInformation = this.initShaderInformation(program);
            this.textureManager = new _TextureManager2.default(801, 801, 10, 4);
            // this.textureManager.maxHeight = gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
            // this.textureManager.maxWidth = this.textureManager.maxHeight;
            // 设置透视矩阵
            var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            // let m2 = MyMat4.perspective(60 * Math.PI / 180, aspect, 1, 2000);
            var m1 = _Mat2.default.projection(gl.canvas.width, gl.canvas.height, 2000);
            m1 = _Mat2.default.orthoProjection(0, 0, gl.canvas.width, gl.canvas.height, -1000, 1000);
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
    }, {
        key: "initShaderInformation",
        value: function initShaderInformation(program) {
            var gl = this.gl;

            var textureCoordAttribute = gl.getAttribLocation(program, "u_texCoord");
            gl.enableVertexAttribArray(textureCoordAttribute);

            var vertexAttribute = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(vertexAttribute);

            var transformMatrixIndex = gl.getAttribLocation(program, "transform_matrix_index");
            gl.enableVertexAttribArray(transformMatrixIndex);

            var colorAttribute = gl.getAttribLocation(program, 'color');
            gl.enableVertexAttribArray(colorAttribute);

            // 转化矩阵全局变量
            var perspectiveMatrix = gl.getUniformLocation(program, "perspective_matrix");
            var transformMatrixArray = new Array(this.maxTransformMatrixNum);
            for (var i = 0; i < transformMatrixArray.length; i++) {
                transformMatrixArray[i] = gl.getUniformLocation(program, "transform_matrix_array[" + i + "]");
            }
            gl.uniformMatrix4fv(transformMatrixArray[0], false, _Mat2.default.identity());
            var singleCanvas = gl.getUniformLocation(program, "singleCanvas");
            var lightPosition = gl.getUniformLocation(program, "u_lightPosition");
            var textureLocation = gl.getUniformLocation(program, "u_texture");

            // 创建数据缓存
            var verticesBuffer = gl.createBuffer();
            var matrixIndexBuffer = gl.createBuffer();
            var blackTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, blackTexture);
            var blackPixel = new Uint8Array([255, 255, 255, 255]);
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
                lightPosition: lightPosition,
                webgl: gl
            };
        }

        /**
         * 创建作色器
         * @param type 着色器类型
         * @param source 代码源
         * @returns {*} Shader对象
         */

    }, {
        key: "loadShader",
        value: function loadShader(type, source) {
            var gl = this.gl;
            var shader = gl.createShader(type);
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

    }, {
        key: "getVertexShaderSource",
        value: function getVertexShaderSource(transformMatrixCount) {
            var vsSource = ' attribute vec4 color;\n' + '     attribute vec4 a_position;\n' + '     attribute vec2 u_texCoord;\n' + '     attribute float transform_matrix_index;\n' + '     varying vec2 v_texcoord;\n' + '     varying vec4 currentColor;\n' + '     varying vec3 normal;\n' + '     uniform mat4 perspective_matrix;\n' + '     uniform mat4 transform_matrix_array[' + transformMatrixCount + '];\n' + '     void main() {\n' + '             normal = vec3(0,0,1);\n' + '             v_texcoord = u_texCoord;\n' + '            // 切换坐标系到投影坐标系中\n' + '            vec4 new_position = transform_matrix_array[int(transform_matrix_index)] * a_position;\n' + '            normal = mat3(transform_matrix_array[int(transform_matrix_index)]) * normal;\n' + '            vec4 finalPosition = perspective_matrix* new_position;\n' + '            currentColor = vec4 (color.xyz/255.0,color.w/100.0);\n' + '            gl_Position = finalPosition;\n' + '    }';
            return vsSource;
        }
    }, {
        key: "maxTransformMatrixNum",
        get: function get() {
            return this[_maxTransformMatrixNum];
        }
    }]);

    return WebGLRender;
}();

exports.default = WebGLRender;