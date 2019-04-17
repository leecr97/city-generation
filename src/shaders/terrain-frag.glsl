#version 300 es
precision highp float;

uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane

in vec3 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;

in float fs_Sine;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

void main()
{
    float t = clamp(smoothstep(40.0, 50.0, length(fs_Pos)), 0.0, 1.0); // Distance fog
    vec3 watercol = vec3(66.0, 134.0, 244.0) / 255.0;
    vec3 landcol = vec3(142.0, 88.0, 114.0) / 255.0;
    vec3 col;
    if (fs_Sine == 0.0) {
        col = watercol;
    }
    else {
        col = landcol;
    }
    // out_Col = vec4(mix(col, vec3(164.0 / 255.0, 233.0 / 255.0, 1.0), t), 1.0);
    out_Col = vec4(col, 1.0);
}
