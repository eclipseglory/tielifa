"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TextureManager = require("./TextureManager.js");

var _TextureManager2 = _interopRequireDefault(_TextureManager);

var _Mat = require("../math/Mat4.js");

var _Mat2 = _interopRequireDefault(_Mat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fsSource = "\n  precision mediump float;\n  varying vec4 currentColor;\n  varying vec2 v_texcoord;\n  varying vec3 normal;\n  varying vec3 v_position;\n  uniform vec2 singleCanvas;\n  uniform vec3 u_lightPosition;\n  uniform float enableLight;\n  uniform sampler2D u_texture;\n  void main() {\n        vec2 coord = vec2(v_texcoord.x / singleCanvas.x , v_texcoord.y/singleCanvas.y);\n        vec4 color = currentColor;\n        vec3 r_normal = normalize(normal);    \n        vec3 forward = u_lightPosition - v_position;\n        vec3 lightLocation = normalize(forward);    \n        gl_FragColor = color * texture2D(u_texture,coord);\n        if(enableLight == 1.0){\n            gl_FragColor.rgb *= abs(dot(r_normal,lightLocation));\n        }\n  }\n  ";
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

var _program = Symbol('WebGL的program');
var _maxTransformMatrixNum = Symbol('转换矩阵变量可用的最大数量');

var WebGLRender = function () {
    function WebGLRender(gl, maxTransformNum, textureMaxSize, projectionType, fov, enableLight) {
        _classCallCheck(this, WebGLRender);

        this.gl = gl;
        this.DEBUG_DRAW_COUNT = 0;
        this.defaultTransformMatrix = _Mat2.default.identity();
        this.orthoProjectionMatrix = _Mat2.default.identity();
        this.perspectiveMatrix = _Mat2.default.identity();
        projectionType = projectionType || 0;
        textureMaxSize = textureMaxSize || gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
        var maxVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        // 顶点作色器里已经用了一个mat4了，就是4个vector,减去这4个然后除以4就得到可以定义的最大mat4数组
        maxTransformNum = maxTransformNum || Math.floor((maxVectors - 4) / 4);
        // debug:
        maxTransformNum = 2;
        this[_maxTransformMatrixNum] = maxTransformNum;
        this.textureManager = null;
        this.verticesData = null;
        this.fragmentData = null;
        this.transformMatrixData = null;
        this.canvasWidth = -1;
        this.canvasHeight = -1;
        this.lightPosition = new Float32Array(3);
        this.lightPosition[0] = gl.canvas.clientWidth / 2;
        this.lightPosition[1] = gl.canvas.clientHeight / 2;
        this.lightPosition[2] = 0;
        this.projectionType = projectionType;
        this.fov = fov;
        this.init();
        this.textureManager.maxHeight = textureMaxSize;
        this.textureManager.maxWidth = this.textureManager.maxHeight;
        enableLight = enableLight || false;
        this.enableLight(enableLight);
    }

    _createClass(WebGLRender, [{
        key: "enableLight",
        value: function enableLight(flag) {
            var value = 0;
            if (flag) value = 1.0;else value = 0;
            this.gl.uniform1f(this.shaderInformation.enableLight, value);
        }
    }, {
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
        key: "setUniformTransformMatrix",
        value: function setUniformTransformMatrix(matrix, id) {
            var gl = this.gl;
            gl.uniformMatrix4fv(this.shaderInformation.transformMatrixArray[id], false, matrix);
        }
    }, {
        key: "prepareWebGLBuffer",
        value: function prepareWebGLBuffer() {
            var gl = this.gl;
            var shaderInfo = this.shaderInformation;
            gl.enableVertexAttribArray(shaderInfo.vertexAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.verticesBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.verticesData.buffer, gl.DYNAMIC_DRAW);

            var size = 3;
            var type = gl.FLOAT;
            var normalize = false;
            var stride = 32;
            var offset = 0;
            gl.vertexAttribPointer(shaderInfo.vertexAttribute, size, type, normalize, stride, offset);
            //法向量数据：
            type = gl.FLOAT;
            size = 3;
            offset = 16; // 4 * 4;//因为有一个空的float32，所以要多移动4个字节
            normalize = true; //单位划该向量
            gl.vertexAttribPointer(shaderInfo.normalAttribute, size, type, normalize, stride, offset);

            gl.enableVertexAttribArray(shaderInfo.colorAttribute);
            gl.enableVertexAttribArray(shaderInfo.textureCoordAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.fragmentBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.fragmentData.buffer, gl.DYNAMIC_DRAW);

            type = gl.UNSIGNED_BYTE;
            stride = this.fragmentData.singleDataByteLength;
            size = 3;
            offset = 0;
            normalize = false;
            gl.vertexAttribPointer(shaderInfo.colorAttribute, size, type, normalize, stride, offset);

            type = gl.FLOAT;
            size = 1;
            offset = 4;
            gl.vertexAttribPointer(shaderInfo.alphaAttribute, size, type, normalize, stride, offset);

            type = gl.FLOAT;
            size = 2;
            offset = 8;
            gl.vertexAttribPointer(shaderInfo.textureCoordAttribute, size, type, normalize, stride, offset);

            gl.enableVertexAttribArray(shaderInfo.transformMatrixIndex);
            gl.bindBuffer(gl.ARRAY_BUFFER, shaderInfo.matrixIndexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.transformMatrixData.buffer, gl.DYNAMIC_DRAW);
            type = gl.FLOAT;
            size = 1;
            offset = 0;
            stride = 4;
            gl.vertexAttribPointer(shaderInfo.transformMatrixIndex, size, type, normalize, stride, offset);
        }
    }, {
        key: "executeRenderAction",
        value: function executeRenderAction(actionList) {
            this.prepareWebGLBuffer();
            var matrixIndex = 1; // 每次绘制都要重新设置矩阵的索引
            var lastAction = undefined;
            var startIndex = 0;
            var rendNumber = 0;
            for (var i = 0; i < actionList.length; i++) {
                var currentAction = actionList[i];
                if (lastAction == undefined) lastAction = currentAction;
                // 先收集顶点数据，顶点的矩阵在下一步再设置
                if (currentAction.textureIndex != lastAction.textureIndex && currentAction.textureIndex != -1 && lastAction.textureIndex != -1) {
                    this.renderVertices(startIndex, rendNumber, lastAction.textureIndex);
                    lastAction = currentAction;
                    startIndex = rendNumber;
                    rendNumber = 0;
                }
                if (lastAction.textureIndex == -1 && currentAction.textureIndex != -1) {
                    lastAction = currentAction;
                }
                rendNumber += currentAction.renderPointNumber;
            }

            if (lastAction != undefined) {
                this.renderVertices(startIndex, rendNumber, lastAction.textureIndex);
            }
        }
    }, {
        key: "renderVertices",
        value: function renderVertices(startIndex, renderPointNumber, textureIndex) {
            if (renderPointNumber == 0) {
                return;
            }
            var gl = this.gl;
            this.initProjectionMatrix();
            this.gl.uniform3f(this.shaderInformation.lightPosition, this.lightPosition[0], this.lightPosition[1], this.lightPosition[2]);
            this.configTexture(textureIndex);
            gl.drawArrays(gl.TRIANGLES, startIndex, renderPointNumber);
            this.DEBUG_DRAW_COUNT++;
        }
    }, {
        key: "initProjectionMatrix",
        value: function initProjectionMatrix() {
            var gl = this.gl;
            // 设置透视矩阵
            if (this.canvasHeight != gl.canvas.clientHeight && this.canvasWidth != gl.canvas.clientWidth) {
                var t = Math.tan(this.fov * Math.PI / 180);
                var defaultDepth = -gl.canvas.height / (2 * t);
                // 为了配合预设的深度
                _Mat2.default.identityMatrix(this.defaultTransformMatrix);
                _Mat2.default.translationMatrix(this.defaultTransformMatrix, 0, 0, defaultDepth);
                gl.uniformMatrix4fv(this.shaderInformation.transformMatrixArray[0], false, this.defaultTransformMatrix);
                var m1 = void 0;
                var near = 1;
                if (this.projectionType == 0) {
                    m1 = _Mat2.default.orthoProjection(0, 0, gl.canvas.width, gl.canvas.height, near, Math.abs(defaultDepth * 2), this.orthoProjectionMatrix);
                } else {
                    var theta = Math.atan2(gl.canvas.clientHeight / 2, Math.abs(defaultDepth));
                    m1 = _Mat2.default.perspective3(theta * 2, gl.canvas.clientWidth, gl.canvas.clientHeight, near, Math.abs(defaultDepth * 2), this.perspectiveMatrix);
                }
                gl.uniformMatrix4fv(this.shaderInformation.perspectiveMatrix, false, m1);
                this.canvasHeight = gl.canvas.clientHeight;
                this.canvasWidth = gl.canvas.clientWidth;
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
        }

        // setPerspective(viewAngel, near, far) {
        //     let aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        //     let m = Mat4.perspective2(0, 0, this.gl.canvas.clientWidth, this.gl.canvas.clientHeight, near, far);
        //     m = Mat4.perspective(viewAngel, aspect, near, far);
        //     m = Mat4.perspective3(viewAngel, this.gl.canvas.clientWidth, this.gl.canvas.clientHeight, near, far);
        //     this.gl.uniformMatrix4fv(this.shaderInformation.perspectiveMatrix, false, m);
        // }

    }, {
        key: "initShaderInformation",
        value: function initShaderInformation(program) {
            var gl = this.gl;

            var textureCoordAttribute = gl.getAttribLocation(program, "u_texCoord");
            gl.enableVertexAttribArray(textureCoordAttribute);

            var vertexAttribute = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(vertexAttribute);

            var normalAttribute = gl.getAttribLocation(program, "a_normal");
            gl.enableVertexAttribArray(normalAttribute);

            var transformMatrixIndex = gl.getAttribLocation(program, "transform_matrix_index");
            gl.enableVertexAttribArray(transformMatrixIndex);

            var colorAttribute = gl.getAttribLocation(program, 'color');
            gl.enableVertexAttribArray(colorAttribute);

            var alphaAttribute = gl.getAttribLocation(program, 'alpha');
            gl.enableVertexAttribArray(alphaAttribute);

            // 转化矩阵全局变量
            var perspectiveMatrix = gl.getUniformLocation(program, "perspective_matrix");
            var transformMatrixArray = new Array(this.maxTransformMatrixNum);
            for (var i = 0; i < transformMatrixArray.length; i++) {
                transformMatrixArray[i] = gl.getUniformLocation(program, "transform_matrix_array[" + i + "]");
            }

            var singleCanvas = gl.getUniformLocation(program, "singleCanvas");
            var lightPosition = gl.getUniformLocation(program, "u_lightPosition");
            var enableLight = gl.getUniformLocation(program, "enableLight");
            var textureLocation = gl.getUniformLocation(program, "u_texture");
            // 创建数据缓存
            var verticesBuffer = gl.createBuffer();
            var matrixIndexBuffer = gl.createBuffer();
            var fragmentBuffer = gl.createBuffer();

            var blackTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, blackTexture);
            var blackPixel = new Uint8Array([255, 255, 255, 255]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blackPixel);
            gl.bindTexture(gl.TEXTURE_2D, null);
            return {
                vertexAttribute: vertexAttribute,
                normalAttribute: normalAttribute,
                colorAttribute: colorAttribute,
                alphaAttribute: alphaAttribute,
                textureCoordAttribute: textureCoordAttribute,
                verticesBuffer: verticesBuffer,
                fragmentBuffer: fragmentBuffer,
                matrixIndexBuffer: matrixIndexBuffer,
                perspectiveMatrix: perspectiveMatrix,
                transformMatrixArray: transformMatrixArray,
                transformMatrixIndex: transformMatrixIndex,
                singleCanvas: singleCanvas,
                textureLocation: textureLocation,
                blackTexture: blackTexture,
                lightPosition: lightPosition,
                enableLight: enableLight,
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
            var vsSource = ' attribute vec3 color;\n' + '     attribute vec4 a_position;\n' + '     attribute vec3 a_normal;\n' + '     attribute float alpha;\n' + '     attribute vec2 u_texCoord;\n' + '     varying vec3 v_position;\n' + '     attribute float transform_matrix_index;\n' + '     varying vec2 v_texcoord;\n' + '     varying vec4 currentColor;\n' + '     varying vec3 normal;\n' + '     uniform mat4 perspective_matrix;\n' + '     uniform mat4 transform_matrix_array[' + transformMatrixCount + '];\n' + '     void main() {\n' + '            normal = a_normal;\n' + '            vec4 yuandian = vec4(0,0,0,1);\n' + '            v_texcoord = u_texCoord;\n' + '            vec4 new_position = transform_matrix_array[int(transform_matrix_index)] * a_position;\n' + '            v_position = vec3(new_position.xyz);\n' + '            vec4 finalPosition = perspective_matrix* new_position;\n' + '            currentColor = vec4 (color.xyz/255.0,alpha);\n' + '            gl_Position = finalPosition;\n' + '    }';
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