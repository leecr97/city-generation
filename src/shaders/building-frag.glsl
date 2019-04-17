#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform float u_Time;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_PlanePos;

out vec4 out_Col;

const float EPSILON = 0.01;


// lighting stuff

// vec3 estimateNormal(vec3 p) {
//     return normalize(vec3(
//         sceneSDF(vec3(p.x + EPSILON, p.y, p.z)) - sceneSDF(vec3(p.x - EPSILON, p.y, p.z)),
//         sceneSDF(vec3(p.x, p.y + EPSILON, p.z)) - sceneSDF(vec3(p.x, p.y - EPSILON, p.z)),
//         sceneSDF(vec3(p.x, p.y, p.z + EPSILON)) - sceneSDF(vec3(p.x, p.y, p.z - EPSILON))
//     ));
// }

vec3 phongContribForLight(vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 lightPos, vec3 lightIntensity) {
  vec3 N = fs_Nor.xyz;
  vec3 L = normalize(lightPos - p);
  vec3 V = normalize(u_Eye - p);
  vec3 R = normalize(reflect(-L, N));

  float dotLN = dot(L, N);
  float dotRV = dot(R, V);

  if (dotLN < 0.0) {
    return vec3(0.0, 0.0, 0.0);
  }
  if (dotRV < 0.0) {
    return lightIntensity * (k_d * dotLN);
  }
  return lightIntensity * (k_d * dotLN + k_s * pow(dotRV, alpha));
}

vec3 phongIllumination(vec3 k_a, vec3 k_d, vec3 k_s, float alpha, vec3 p) {
  const vec3 ambientLight = 0.5 * vec3(1.0, 1.0, 1.0);
  vec3 color = ambientLight * k_a;

  vec3 light1Pos = vec3(-4.0, 2.0, 4.0);
  vec3 light1Intensity = vec3(0.4, 0.4, 0.4);

  color += phongContribForLight(k_d, k_s, alpha, p, light1Pos, light1Intensity);

  vec3 light2Pos = vec3(2.0 * sin(0.37 * u_Time),
                        2.0 * cos(0.37 * u_Time),
                        2.0);
  vec3 light2Intensity = vec3(0.4, 0.4, 0.4);

  color += phongContribForLight(k_d, k_s, alpha, p, light2Pos, light2Intensity);   
  
  return color;
}

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

vec3 getNoiseCol(in vec4 p) {    
    vec2 st = p.zy;

    st *= 5.0; // Scale the coordinate system
    vec2 ipos = floor(st);  // get the integer coords
    vec2 fpos = fract(st);  // get the fractional coords

    // Assign a random value based on the integer coord
    vec3 color = vec3(random( ipos ) * (sin(u_Time * fpos.x / 5.0)));
    return color;
}

void main()
{
    // float dist = 1.0 - (length(fs_Pos.xyz) * 2.0);
    // out_Col = vec4(dist) * fs_Col;

    vec3 K_a = vec3(0.2, 0.2, 0.2);
    vec3 K_d = vec3(0.7, 0.2, 0.2);
    vec3 K_s = vec3(1.0, 1.0, 1.0);
    float shininess = 0.5;

    vec3 phongColor = phongIllumination(K_a, K_d, K_s, shininess, fs_PlanePos.xyz);
    vec3 noiseColor = getNoiseCol(fs_PlanePos);
    vec3 color = phongColor * noiseColor;

    out_Col = vec4(color, 1.0);
    // out_Col = fs_Col;
}
