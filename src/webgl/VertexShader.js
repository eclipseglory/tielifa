// GLSL源代码查看VertexShader.glsl

let source = "attribute vec3 color;\n" +
    "attribute vec4 a_position;\n" +
    "attribute vec3 a_normal;\n" +
    "attribute float alpha;\n" +
    "attribute vec2 u_texCoord;\n" +
    "attribute float u_filterType;\n" +
    "varying vec3 v_position;\n" +
    "varying float v_filterType;\n" +
    "attribute float transform_matrix_index;\n" +
    "varying vec2 v_texcoord;\n" +
    "varying vec4 currentColor;\n" +
    "varying vec3 normal;\n" +
    "uniform mat4 perspective_matrix;\n" +
    "uniform mat4 transform_matrix_array[@transformMatrixCount];\n" +
    "void main() {\n" +
    "    normal = a_normal;\n" +
    "    float ft = u_filterType;\n" +
    "    v_filterType = u_filterType + 0.5;\n" +
    "    vec4 yuandian = vec4(0,0,0,1);\n" +
    "    v_texcoord = u_texCoord;\n" +
    "    vec4 new_position = transform_matrix_array[0] * a_position;\n" +
    "    v_position = vec3(new_position.xyz);\n" +
    "    vec4 finalPosition = perspective_matrix* new_position;\n" +
    "    currentColor = vec4 (color.xyz/255.0,alpha);\n" +
    "    gl_Position = finalPosition;\n" +
    "}";
export default source;

let test =
    "    attribute vec2 position;\n" +
    "    varying vec2 t_position;\n" +
    "    uniform mat4 perspective_matrix;\n" +
    "    void main() {\n" +
    "        // 因为给的是一个2个数字的坐标，这里把坐标数据补全\n" +
    "        vec4 new_position = vec4(position.x, position.y, 0, 1);\n" +
    "        // 用二维的正投矩阵得到最终的坐标位置\n" +
    "        vec4 final_position = perspective_matrix * new_position;\n" +
    "        // 插值给Fragment\n" +
    "        texture_position = t_position;\n" +
    "        gl_Position = final_position;\n" +
    "    }"