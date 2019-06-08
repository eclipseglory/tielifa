// GLSL源代码查看FragmentShader.glsl
let source ="precision mediump float;\n" +
    "varying vec4 currentColor;\n" +
    "varying vec2 v_texcoord;\n" +
    "varying vec3 normal;\n" +
    "varying vec3 v_position;\n" +
    "varying float v_filterType;\n" +
    "uniform vec2 singleCanvas;\n" +
    "uniform vec3 u_lightPosition;\n" +
    "uniform vec3 u_lightColor;\n" +
    "uniform float enableLight;\n" +
    "uniform vec3 u_Ambient_color;\n" +
    "uniform vec3 u_ObserverPosition;\n" +
    "uniform float u_Shininess;\n" +
    "uniform sampler2D u_texture[10];\n" +
    "\n" +
    "void getNormalFilter(inout float filter[9]){\n" +
    "    filter[0] = 0.0;\n" +
    "    filter[1] = 0.0;\n" +
    "    filter[2] = 0.0;\n" +
    "    filter[3] = 0.0;\n" +
    "    filter[4] = 1.0;\n" +
    "    filter[5] = 0.0;\n" +
    "    filter[6] = 0.0;\n" +
    "    filter[7] = 0.0;\n" +
    "    filter[8] = 0.0;\n" +
    "}\n" +
    "\n" +
    "void getGaussianBlurFilter(inout float filter[9]){\n" +
    "    filter[0] = 0.045;\n" +
    "    filter[1] = 0.122;\n" +
    "    filter[2] = 0.045;\n" +
    "    filter[3] = 0.122;\n" +
    "    filter[4] = 0.332;\n" +
    "    filter[5] = 0.122;\n" +
    "    filter[6] = 0.045;\n" +
    "    filter[7] = 0.122;\n" +
    "    filter[8] = 0.045;\n" +
    "}\n" +
    "\n" +
    "void getUnsharpenFilter(inout float filter[9]){\n" +
    "    filter[0] = -1.0;\n" +
    "    filter[1] = -1.0;\n" +
    "    filter[2] = -1.0;\n" +
    "    filter[3] = -1.0;\n" +
    "    filter[4] = 9.0;\n" +
    "    filter[5] = -1.0;\n" +
    "    filter[6] = -1.0;\n" +
    "    filter[7] = -1.0;\n" +
    "    filter[8] = -1.0;\n" +
    "}\n" +
    "\n" +
    "void getSharpnessFilter(inout float filter[9]){\n" +
    "    filter[0] = 0.0;\n" +
    "    filter[1] = -1.0;\n" +
    "    filter[2] = 0.0;\n" +
    "    filter[3] = -1.0;\n" +
    "    filter[4] = 5.0;\n" +
    "    filter[5] = -1.0;\n" +
    "    filter[6] = 0.0;\n" +
    "    filter[7] = -1.0;\n" +
    "    filter[8] = 0.0;\n" +
    "}\n" +
    "\n" +
    "void getSharpenFilter(inout float filter[9]){\n" +
    "    filter[0] = -0.125;\n" +
    "    filter[1] = -0.125;\n" +
    "    filter[2] = -0.125;\n" +
    "    filter[3] = -0.125;\n" +
    "    filter[4] =  2.0;\n" +
    "    filter[5] = -0.125;\n" +
    "    filter[6] = -0.125;\n" +
    "    filter[7] = -0.125;\n" +
    "    filter[8] = -0.125;\n" +
    "}\n" +
    "\n" +
    "void getEdgeDetectFilter(inout float filter[9]){\n" +
    "    filter[0] = -5.0;\n" +
    "    filter[1] = -5.0;\n" +
    "    filter[2] = -5.0;\n" +
    "    filter[3] = -5.0;\n" +
    "    filter[4] =  39.0;\n" +
    "    filter[5] = -5.0;\n" +
    "    filter[6] = -5.0;\n" +
    "    filter[7] = -5.0;\n" +
    "    filter[8] = -5.0;\n" +
    "}\n" +
    "\n" +
    "void getSobelHorizontalFilter(inout float filter[9]){\n" +
    "    filter[0] = 1.0;\n" +
    "    filter[1] = 2.0;\n" +
    "    filter[2] = 1.0;\n" +
    "    filter[3] = 0.0;\n" +
    "    filter[4] =  0.0;\n" +
    "    filter[5] = 0.0;\n" +
    "    filter[6] = -1.0;\n" +
    "    filter[7] = -2.0;\n" +
    "    filter[8] = -1.0;\n" +
    "}\n" +
    "\n" +
    "void getSobelVerticalFilter(inout float filter[9]){\n" +
    "    filter[0] = 1.0;\n" +
    "    filter[1] = 0.0;\n" +
    "    filter[2] = -1.0;\n" +
    "    filter[3] = 2.0;\n" +
    "    filter[4] =  0.0;\n" +
    "    filter[5] = -2.0;\n" +
    "    filter[6] = 1.0;\n" +
    "    filter[7] = 0.0;\n" +
    "    filter[8] = -1.0;\n" +
    "}\n" +
    "\n" +
    "void getPrevitHorizontalFilter(inout float filter[9]){\n" +
    "    filter[0] = 1.0;\n" +
    "    filter[1] = 1.0;\n" +
    "    filter[2] = 1.0;\n" +
    "    filter[3] = 0.0;\n" +
    "    filter[4] = 0.0;\n" +
    "    filter[5] = 0.0;\n" +
    "    filter[6] = -1.0;\n" +
    "    filter[7] = -1.0;\n" +
    "    filter[8] = -1.0;\n" +
    "}\n" +
    "\n" +
    "void getPrevitVerticalFilter(inout float filter[9]){\n" +
    "    filter[0] = 1.0;\n" +
    "    filter[1] = 0.0;\n" +
    "    filter[2] = -1.0;\n" +
    "    filter[3] = 1.0;\n" +
    "    filter[4] = 0.0;\n" +
    "    filter[5] = -1.0;\n" +
    "    filter[6] = 1.0;\n" +
    "    filter[7] = 0.0;\n" +
    "    filter[8] = -1.0;\n" +
    "}\n" +
    "\n" +
    "void getBoxBlurFilter(inout float filter[9]){\n" +
    "    filter[0] = 0.111;\n" +
    "    filter[1] = 0.111;\n" +
    "    filter[2] = 0.111;\n" +
    "    filter[3] = 0.111;\n" +
    "    filter[4] = 0.111;\n" +
    "    filter[5] = 0.111;\n" +
    "    filter[6] = 0.111;\n" +
    "    filter[7] = 0.111;\n" +
    "    filter[8] = 0.111;\n" +
    "}\n" +
    "\n" +
    "void getTriangleBlurFilter(inout float filter[9]){\n" +
    "    filter[0] = 0.0625;\n" +
    "    filter[1] = 0.125;\n" +
    "    filter[2] = 0.0625;\n" +
    "    filter[3] = 0.125;\n" +
    "    filter[4] = 0.25;\n" +
    "    filter[5] = 0.125;\n" +
    "    filter[6] = 0.0625;\n" +
    "    filter[7] = 0.125;\n" +
    "    filter[8] = 0.0625;\n" +
    "}\n" +
    "\n" +
    "void getEmbossFilter(inout float filter[9]){\n" +
    "    filter[0] = -2.0;\n" +
    "    filter[1] = -1.0;\n" +
    "    filter[2] = 0.0;\n" +
    "    filter[3] = -1.0;\n" +
    "    filter[4] = 1.0;\n" +
    "    filter[5] = 1.0;\n" +
    "    filter[6] = 0.0;\n" +
    "    filter[7] = 1.0;\n" +
    "    filter[8] = 2.0;\n" +
    "}\n" +
    "\n" +
    "void filter3(in float kernel[9], in vec2 coord, in vec2 onePixel, inout vec4 colorSum){\n" +
    "    float offset = -1.0;\n" +
    "    for (float i = 0.0; i < 3.0;i++){\n" +
    "        for (float j =0.0;j < 3.0;j++){\n" +
    "            colorSum += texture2D(u_texture[0], coord + onePixel * vec2(offset + j, offset+ i)) * kernel[int(i*3.0+j)];\n" +
    "        }\n" +
    "    }\n" +
    "}\n" +
    "\n" +
    "void filter5(in float kernel[25], in vec2 coord, in vec2 onePixel, inout vec4 colorSum){\n" +
    "    float offset = -2.0;\n" +
    "    for (float i = 0.0; i < 5.0;i++){\n" +
    "        for (float j =0.0;j < 5.0;j++){\n" +
    "            colorSum += texture2D(u_texture[0], coord + onePixel * vec2(offset + j, offset+ i)) * kernel[int(i*5.0+j)];\n" +
    "        }\n" +
    "    }\n" +
    "}\n" +
    "\n" +
    "void main() {\n" +
    "\n" +
    "    vec3 to_light;\n" +
    "    vec3 vertex_normal;\n" +
    "    vec3 reflection;\n" +
    "    vec3 to_camera;\n" +
    "    float cos_angle;\n" +
    "    vec3 diffuse_color;\n" +
    "    vec3 specular_color;\n" +
    "    vec3 ambient_color;\n" +
    "\n" +
    "    vec2 coord = vec2(v_texcoord.x / singleCanvas.x, v_texcoord.y/singleCanvas.y);\n" +
    "    vec2 onePixel = vec2(1.0/singleCanvas.x, 1.0/singleCanvas.y);\n" +
    "    vec4 color = currentColor;\n" +
    "    float opacity = texture2D(u_texture[0], coord).a * color.a;\n" +
    "    float kernel3[9];\n" +
    "    float kernel5[25];\n" +
    "    vec4 colorSum = vec4(0.0, 0.0, 0.0, 0.0);\n" +
    "\n" +
    "    if (int(v_filterType) == 0){\n" +
    "        getNormalFilter(kernel3);\n" +
    "        filter3(kernel3, coord, onePixel, colorSum);\n" +
    "    } else\n" +
    "    if (int(v_filterType) == 1){\n" +
    "        getGaussianBlurFilter(kernel3);\n" +
    "        filter3(kernel3, coord, onePixel, colorSum);\n" +
    "    } else\n" +
    "    if (int(v_filterType) == 2){\n" +
    "        getUnsharpenFilter(kernel3);\n" +
    "        filter3(kernel3, coord, onePixel, colorSum);\n" +
    "    }\n" +
    "    else\n" +
    "    if (int(v_filterType) == 3){\n" +
    "        getSharpnessFilter(kernel3);\n" +
    "        filter3(kernel3, coord, onePixel, colorSum);\n" +
    "    } else\n" +
    "    if (int(v_filterType) == 4){\n" +
    "        getSharpenFilter(kernel3);\n" +
    "        filter3(kernel3, coord, onePixel, colorSum);\n" +
    "    } else\n" +
    "    if (int(v_filterType) == 5){\n" +
    "        getEdgeDetectFilter(kernel3);\n" +
    "        filter3(kernel3, coord, onePixel, colorSum);\n" +
    "    } else\n" +
    "    if (int(v_filterType) == 6){\n" +
    "        getSobelHorizontalFilter(kernel3);\n" +
    "        filter3(kernel3, coord, onePixel, colorSum);\n" +
    "    } else\n" +
    "    if (int(v_filterType) == 7){\n" +
    "        getSobelVerticalFilter(kernel3);\n" +
    "        filter3(kernel3, coord, onePixel, colorSum);\n" +
    "    } else\n" +
    "    if (int(v_filterType) == 8){\n" +
    "        getPrevitHorizontalFilter(kernel3);\n" +
    "        filter3(kernel3, coord, onePixel, colorSum);\n" +
    "    } else\n" +
    "    if (int(v_filterType) == 9){\n" +
    "        getPrevitVerticalFilter(kernel3);\n" +
    "        filter3(kernel3, coord, onePixel, colorSum);\n" +
    "    } else\n" +
    "    if (int(v_filterType) == 10){\n" +
    "        getBoxBlurFilter(kernel3);\n" +
    "        filter3(kernel3, coord, onePixel, colorSum);\n" +
    "    } else\n" +
    "    if (int(v_filterType) == 11){\n" +
    "        getTriangleBlurFilter(kernel3);\n" +
    "        filter3(kernel3, coord, onePixel, colorSum);\n" +
    "    } else\n" +
    "    if (int(v_filterType) == 12){\n" +
    "        getEmbossFilter(kernel3);\n" +
    "        filter3(kernel3, coord, onePixel, colorSum);\n" +
    "    }\n" +
    "    vec3 v_Normal = normalize(normal);\n" +
    "    vec4 v_Color = color * colorSum;\n" +
    "    // Calculate the ambient color as a percentage of the surface color\n" +
    "    ambient_color = u_Ambient_color * vec3(v_Color);\n" +
    "\n" +
    "    // Calculate a vector from the fragment location to the light source\n" +
    "    to_light = u_lightPosition - v_position;\n" +
    "    to_light = normalize( to_light );\n" +
    "\n" +
    "    // The vertex's normal vector is being interpolated across the primitive\n" +
    "    // which can make it un-normalized. So normalize the vertex's normal vector.\n" +
    "    vertex_normal = normalize( v_Normal );\n" +
    "\n" +
    "    // Calculate the cosine of the angle between the vertex's normal vector\n" +
    "    // and the vector going to the light.\n" +
    "    cos_angle = dot(vertex_normal, to_light);\n" +
    "    cos_angle = clamp(cos_angle, 0.0, 1.0);\n" +
    "\n" +
    "    // Scale the color of this fragment based on its angle to the light.\n" +
    "    diffuse_color = vec3(v_Color) * cos_angle;\n" +
    "\n" +
    "    // Calculate the reflection vector\n" +
    "    reflection = 2.0 * dot(vertex_normal,to_light) * vertex_normal - to_light;\n" +
    "\n" +
    "    // Calculate a vector from the fragment location to the camera.\n" +
    "    // The camera is at the origin, so negating the vertex location gives the vector\n" +
    "    to_camera = u_ObserverPosition - v_position;\n" +
    "    // Calculate the cosine of the angle between the reflection vector\n" +
    "    // and the vector going to the camera.\n" +
    "    reflection = normalize( reflection );\n" +
    "    to_camera = normalize( to_camera );\n" +
    "    cos_angle = dot(reflection, to_camera);\n" +
    "    cos_angle = clamp(cos_angle, 0.0, 1.0);\n" +
    "    cos_angle = pow(cos_angle, u_Shininess);\n" +
    "\n" +
    "    // The specular color is from the light source, not the object\n" +
    "    if (cos_angle > 0.0) {\n" +
    "        specular_color = u_lightColor * cos_angle;\n" +
    "        diffuse_color = diffuse_color * (1.0 - cos_angle);\n" +
    "    } else {\n" +
    "        specular_color = vec3(0.0, 0.0, 0.0);\n" +
    "    }\n" +
    "\n" +
    "    vec3 fColor = ambient_color + diffuse_color + specular_color;\n" +
    "\n" +
    "    gl_FragColor = v_Color;\n" +
    "    if (enableLight == 1.0){\n" +
    "        gl_FragColor = vec4(fColor,v_Color.a);\n" +
    "    }\n" +
    "}";

export default source;