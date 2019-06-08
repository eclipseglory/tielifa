attribute vec3 color;
attribute vec4 a_position;
attribute vec3 a_normal;
attribute float alpha;
attribute vec2 u_texCoord;
attribute float u_filterType;
varying vec3 v_position;
varying float v_filterType;
attribute float transform_matrix_index;
varying vec2 v_texcoord;
varying vec4 currentColor;
varying vec3 normal;
uniform mat4 perspective_matrix;
uniform mat4 transform_matrix_array[@transformMatrixCount];
void main() {
    normal = a_normal;
    float ft = u_filterType;
    v_filterType = u_filterType + 0.5;
    vec4 yuandian = vec4(0,0,0,1);
    v_texcoord = u_texCoord;
    vec4 new_position = transform_matrix_array[0] * a_position;
    v_position = vec3(new_position.xyz);
    vec4 finalPosition = perspective_matrix* new_position;
    currentColor = vec4 (color.xyz/255.0,alpha);
    gl_Position = finalPosition;
}