#version 300 es


uniform mat4 u_Model;
uniform mat4 u_ModelInvTr;
uniform mat4 u_ViewProj;
uniform vec2 u_PlanePos; // Our location in the virtual world displayed by the plane

in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;

out vec3 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_Col;

out float fs_Sine;

float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float random1( vec3 p , vec3 seed) {
  return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}

// perlin noise

vec2 falloff(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
  }
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec3 permute(vec3 x) {
    return mod((34.0 * x + 1.0) * x, 289.0);
  }

float pnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = falloff(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

void generateHeight(vec2 pos, out float off) {  
  pos += vec2(4.7, 4.7);
  pos /= 2.5;
  off = pnoise(vec2(pos.x, pos.y)) + pnoise(vec2(pos.y, pos.x));
  off *= 2.0;
  off += 0.5;
}

void convertPos(vec2 wpos, out vec2 spos) {
  float x = wpos.x;
  float x2 = (x - 150.0) * (2.0 / -300.0) - 1.0;

  float y = wpos.y;
  float y2 = (y + 75.0) * (2.0 / 150.0) - 1.0;
  spos = vec2(x2, y2);
}

void main()
{
  fs_Pos = vs_Pos.xyz;
  // fs_Sine = (sin((vs_Pos.x + u_PlanePos.x) * 3.14159 * 0.1) + cos((vs_Pos.z + u_PlanePos.y) * 3.14159 * 0.1));

  vec2 spos;
  convertPos(fs_Pos.xz, spos);
  bool water;
  float height;
  generateHeight(spos, height);
  if (height < 0.1) {
    water = true;
  }
  else {
    water = false;
  }

  // vec4 modelposition = vec4(vs_Pos.x, fs_Sine * 2.0, vs_Pos.z, 1.0);
  vec4 modelposition;
  if (!water) {
    modelposition = vec4(vs_Pos.x, -1.0, vs_Pos.z, 1.0);
    fs_Sine = 1.0;
  }
  else {
    modelposition = vec4(vs_Pos.x, -2.0, vs_Pos.z, 1.0);
    fs_Sine = 0.0;
  }
  modelposition = u_Model * modelposition;
  gl_Position = u_ViewProj * modelposition;
}
