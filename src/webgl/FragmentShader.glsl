precision mediump float;
varying vec4 currentColor;
varying vec2 v_texcoord;
varying vec3 normal;
varying vec3 v_position;
varying float v_filterType;
uniform vec2 singleCanvas;
uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform float enableLight;
uniform vec3 u_Ambient_color;
uniform vec3 u_ObserverPosition;
uniform float u_Shininess;
uniform sampler2D u_texture[10];

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

void filter3(in float kernel[9], in vec2 coord, in vec2 onePixel, inout vec4 colorSum){
    float offset = -1.0;
    for (float i = 0.0; i < 3.0;i++){
        for (float j =0.0;j < 3.0;j++){
            colorSum += texture2D(u_texture[0], coord + onePixel * vec2(offset + j, offset+ i)) * kernel[int(i*3.0+j)];
        }
    }
}

void filter5(in float kernel[25], in vec2 coord, in vec2 onePixel, inout vec4 colorSum){
    float offset = -2.0;
    for (float i = 0.0; i < 5.0;i++){
        for (float j =0.0;j < 5.0;j++){
            colorSum += texture2D(u_texture[0], coord + onePixel * vec2(offset + j, offset+ i)) * kernel[int(i*5.0+j)];
        }
    }
}

void main() {

    vec3 to_light;
    vec3 vertex_normal;
    vec3 reflection;
    vec3 to_camera;
    float cos_angle;
    vec3 diffuse_color;
    vec3 specular_color;
    vec3 ambient_color;

    vec2 coord = vec2(v_texcoord.x / singleCanvas.x, v_texcoord.y/singleCanvas.y);
    vec2 onePixel = vec2(1.0/singleCanvas.x, 1.0/singleCanvas.y);
    vec4 color = currentColor;
    float opacity = texture2D(u_texture[0], coord).a * color.a;
    float kernel3[9];
    float kernel5[25];
    vec4 colorSum = vec4(0.0, 0.0, 0.0, 0.0);

    if (int(v_filterType) == 0){
        getNormalFilter(kernel3);
        filter3(kernel3, coord, onePixel, colorSum);
    } else
    if (int(v_filterType) == 1){
        getGaussianBlurFilter(kernel3);
        filter3(kernel3, coord, onePixel, colorSum);
    } else
    if (int(v_filterType) == 2){
        getUnsharpenFilter(kernel3);
        filter3(kernel3, coord, onePixel, colorSum);
    }
    else
    if (int(v_filterType) == 3){
        getSharpnessFilter(kernel3);
        filter3(kernel3, coord, onePixel, colorSum);
    } else
    if (int(v_filterType) == 4){
        getSharpenFilter(kernel3);
        filter3(kernel3, coord, onePixel, colorSum);
    } else
    if (int(v_filterType) == 5){
        getEdgeDetectFilter(kernel3);
        filter3(kernel3, coord, onePixel, colorSum);
    } else
    if (int(v_filterType) == 6){
        getSobelHorizontalFilter(kernel3);
        filter3(kernel3, coord, onePixel, colorSum);
    } else
    if (int(v_filterType) == 7){
        getSobelVerticalFilter(kernel3);
        filter3(kernel3, coord, onePixel, colorSum);
    } else
    if (int(v_filterType) == 8){
        getPrevitHorizontalFilter(kernel3);
        filter3(kernel3, coord, onePixel, colorSum);
    } else
    if (int(v_filterType) == 9){
        getPrevitVerticalFilter(kernel3);
        filter3(kernel3, coord, onePixel, colorSum);
    } else
    if (int(v_filterType) == 10){
        getBoxBlurFilter(kernel3);
        filter3(kernel3, coord, onePixel, colorSum);
    } else
    if (int(v_filterType) == 11){
        getTriangleBlurFilter(kernel3);
        filter3(kernel3, coord, onePixel, colorSum);
    } else
    if (int(v_filterType) == 12){
        getEmbossFilter(kernel3);
        filter3(kernel3, coord, onePixel, colorSum);
    }
    vec3 v_Normal = normalize(normal);
    vec4 v_Color = color * colorSum;
    // Calculate the ambient color as a percentage of the surface color
    ambient_color = u_Ambient_color * vec3(v_Color);

    // Calculate a vector from the fragment location to the light source
    to_light = u_lightPosition - v_position;
    to_light = normalize( to_light );

    // The vertex's normal vector is being interpolated across the primitive
    // which can make it un-normalized. So normalize the vertex's normal vector.
    vertex_normal = normalize( v_Normal );

    // Calculate the cosine of the angle between the vertex's normal vector
    // and the vector going to the light.
    cos_angle = dot(vertex_normal, to_light);
    cos_angle = clamp(cos_angle, 0.0, 1.0);

    // Scale the color of this fragment based on its angle to the light.
    diffuse_color = vec3(v_Color) * cos_angle;

    // Calculate the reflection vector
    reflection = 2.0 * dot(vertex_normal,to_light) * vertex_normal - to_light;

    // Calculate a vector from the fragment location to the camera.
    // The camera is at the origin, so negating the vertex location gives the vector
    to_camera = u_ObserverPosition - v_position;
    // Calculate the cosine of the angle between the reflection vector
    // and the vector going to the camera.
    reflection = normalize( reflection );
    to_camera = normalize( to_camera );
    cos_angle = dot(reflection, to_camera);
    cos_angle = clamp(cos_angle, 0.0, 1.0);
    cos_angle = pow(cos_angle, u_Shininess);

    // The specular color is from the light source, not the object
    if (cos_angle > 0.0) {
        specular_color = u_lightColor * cos_angle;
        diffuse_color = diffuse_color * (1.0 - cos_angle);
    } else {
        specular_color = vec3(0.0, 0.0, 0.0);
    }

    vec3 fColor = ambient_color + diffuse_color + specular_color;

    gl_FragColor = v_Color;
    if (enableLight == 1.0){
        gl_FragColor = vec4(fColor,v_Color.a);
    }
}