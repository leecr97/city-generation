#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

// instance rendering
in vec4 vs_Transform1;
in vec4 vs_Transform2;
in vec4 vs_Transform3;
in vec4 vs_Transform4;

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_PlanePos;

void convertPos(vec2 wpos, out vec2 spos) {
  float x = wpos.x;
  float x2 = (x - 0.0) * (2.0 / 2000.0) - 1.0;

  float y = wpos.y;
  float y2 = (y - 0.0) * (2.0 / 1000.0) - 1.0;
  spos = vec2(x2, y2);
}

void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;
    fs_Nor = vs_Nor;

    mat4 transform = mat4(vs_Transform1, vs_Transform2, vs_Transform3, vs_Transform4);
    vec4 tPos = transform * vs_Pos;

    vec2 spos;
    convertPos(tPos.xz, spos);
    fs_PlanePos = vec4(spos.x, tPos.y, spos.y, 1.0);

    gl_Position = u_ViewProj * tPos;

}