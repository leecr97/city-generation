import {vec2, vec3, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import TextureRenderer from './rendering/gl/TextureRenderer';
import TextureReader from './lsystem/texturereader';
import LSystem from './lsystem/lsystem';
import Edge from './lsystem/edge';
import Plane from './geometry/Plane';
import CityGrid from './lsystem/citygrid';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  Map: 0,
  PopulationThreshold: 0.5,
  MaxNumBranches: 4,
  GridSize: 50,
  NumBuildings: 100,
  MaxBuildingHeight: 50,
  BuildingWidth: 2,
};

let square: Square;
let screenQuad: ScreenQuad;
let cube: Cube;
let time: number = 0.0;

let map: number = 0;
let popThres: number = 0.5;
let maxBranch: number = 4;
let gsize: number = 50;

let plane : Plane;
let wPressed: boolean;
let aPressed: boolean;
let sPressed: boolean;
let dPressed: boolean;
let planePos: vec2;

let lsystem: LSystem;
let citygrid: CityGrid;

let numBuild: number = 100;
let maxBHeight: number = 50;
let bWidth: number = 2.0;

function loadInitScene() {
  screenQuad = new ScreenQuad();
  screenQuad.create();
  plane = new Plane(vec3.fromValues(0,0,0), vec2.fromValues(300,150), 20);
  plane.create();

  let colorsArray : number[] = [];
  let col1Array : number[] = [];
  let col2Array : number[] = [];
  let col3Array : number[] = [];
  let col4Array : number[] = [];

  colorsArray = [0.0,0.0,0.0,1.0];
  col1Array = [0, 0, 0, 0];
  col2Array = [0, 0, 0, 0];
  col3Array = [0, 0, 0, 0];
  col4Array = [0, -100, 100, 1];
  let colors : Float32Array = new Float32Array(colorsArray);
  let col1 : Float32Array = new Float32Array(col1Array);
  let col2 : Float32Array = new Float32Array(col2Array);
  let col3 : Float32Array = new Float32Array(col3Array);
  let col4 : Float32Array = new Float32Array(col4Array);
  plane.setInstanceVBOs(colors, col1, col2, col3, col4);
  plane.setNumInstances(1);

  wPressed = false;
  aPressed = false;
  sPressed = false;
  dPressed = false;
  planePos = vec2.fromValues(0,0);
}

function loadScene() {
  square = new Square();
  square.create();

  lsystem.createCity();

  // Set up instanced rendering data arrays here.
  let edgeData: Edge[] = lsystem.edgeData;
  let isectData: vec3[] = lsystem.isectData;

  let colorsArray : number[] = [];
  let col1Array : number[] = [];
  let col2Array : number[] = [];
  let col3Array : number[] = [];
  let col4Array : number[] = [];

  // console.log("e: " + edgeData.length);

  for (let i: number = 0; i < edgeData.length; i++) {
    let e: Edge = edgeData[i];
    let t: mat4 = e.getTransformation();

    // column data
    col1Array.push(t[0]);
    col1Array.push(t[1]);
    col1Array.push(t[2]);
    col1Array.push(t[3]);

    col2Array.push(t[4]);
    col2Array.push(t[5]);
    col2Array.push(t[6]);
    col2Array.push(t[7]);

    col3Array.push(t[8]);
    col3Array.push(t[9]);
    col3Array.push(t[10]);
    col3Array.push(t[11]);

    col4Array.push(t[12]);
    col4Array.push(t[13]);
    col4Array.push(t[14]);
    col4Array.push(t[15]);

    // color data
    colorsArray.push(1);
    colorsArray.push(1);
    colorsArray.push(1);
    colorsArray.push(1);
  }
  let colors : Float32Array = new Float32Array(colorsArray);
  let col1 : Float32Array = new Float32Array(col1Array);
  let col2 : Float32Array = new Float32Array(col2Array);
  let col3 : Float32Array = new Float32Array(col3Array);
  let col4 : Float32Array = new Float32Array(col4Array);
  square.setInstanceVBOs(colors, col1, col2, col3, col4);
  square.setNumInstances(edgeData.length); 
}

function loadCity() {
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();

  citygrid.create(lsystem.edgeData);

  // Set up instanced rendering data arrays here.
  let buildings: vec2[] = citygrid.buildings;
  let buildingData: mat4[] = citygrid.buildingData;

  console.log("b: " + buildings.length);

  let colorsArray : number[] = [];
  let col1Array : number[] = [];
  let col2Array : number[] = [];
  let col3Array : number[] = [];
  let col4Array : number[] = [];

  for (let i: number = 0; i < buildingData.length; i++) {
    let t: mat4 = buildingData[i];

    // column data
    col1Array.push(t[0]);
    col1Array.push(t[1]);
    col1Array.push(t[2]);
    col1Array.push(t[3]);

    col2Array.push(t[4]);
    col2Array.push(t[5]);
    col2Array.push(t[6]);
    col2Array.push(t[7]);

    col3Array.push(t[8]);
    col3Array.push(t[9]);
    col3Array.push(t[10]);
    col3Array.push(t[11]);

    col4Array.push(t[12]);
    col4Array.push(t[13]);
    col4Array.push(t[14]);
    col4Array.push(t[15]);

    // color data
    colorsArray.push(196.0 / 255.0);
    colorsArray.push(142.0 / 255.0);
    colorsArray.push(206.0 / 255.0);
    colorsArray.push(1);
  }
  let colors : Float32Array = new Float32Array(colorsArray);
  let col1 : Float32Array = new Float32Array(col1Array);
  let col2 : Float32Array = new Float32Array(col2Array);
  let col3 : Float32Array = new Float32Array(col3Array);
  let col4 : Float32Array = new Float32Array(col4Array);
  cube.setInstanceVBOs(colors, col1, col2, col3, col4);
  cube.setNumInstances(buildingData.length); 
}

function main() {
  window.addEventListener('keypress', function (e) {
    // console.log(e.key);
    switch(e.key) {
      case 'w':
      wPressed = true;
      break;
      case 'a':
      aPressed = true;
      break;
      case 's':
      sPressed = true;
      break;
      case 'd':
      dPressed = true;
      break;
    }
  }, false);

  window.addEventListener('keyup', function (e) {
    switch(e.key) {
      case 'w':
      wPressed = false;
      break;
      case 'a':
      aPressed = false;
      break;
      case 's':
      sPressed = false;
      break;
      case 'd':
      dPressed = false;
      break;
    }
  }, false);

  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Map', { Terrain: 0, 'Land and Water': 1, 'Population Density': 2, Combined: 3} );
  gui.add(controls, 'PopulationThreshold', 0, 1.0);
  gui.add(controls, 'MaxNumBranches', 1, 5);
  gui.add(controls, 'GridSize', 40, 100);
  gui.add(controls, 'NumBuildings', 20, 200);
  gui.add(controls, 'MaxBuildingHeight', 10, 100);
  gui.add(controls, 'BuildingWidth', 0.5, 5.0);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  // console.log("w: " + canvas.width);
  // console.log("h: " + canvas.height);
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadInitScene();

  // const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));
  // const camera = new Camera(vec3.fromValues(0, 30, -80), vec3.fromValues(0, 0, 0));
  const camera = new Camera(vec3.fromValues(-30, 15, 0), vec3.fromValues(0, 20, 0));

  const renderer = new OpenGLRenderer(canvas);
  // renderer.setClearColor(0.2, 0.2, 0.2, 1);
  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
  renderer.setClearColor(164.0 / 255.0, 233.0 / 255.0, 1.0, 1);
  gl.enable(gl.DEPTH_TEST);

  const terrain = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/terrain-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/terrain-frag.glsl')),
  ]);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const building = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/building-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/building-frag.glsl')),
  ]);

  const sky = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/sky-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/sky-frag.glsl')),
  ])

  const texture = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  function processKeyPresses() {
    let velocity: vec2 = vec2.fromValues(0,0);
    if(wPressed) {
      velocity[1] += 1.0;
      // console.log("moving...");
    }
    if(aPressed) {
      velocity[0] += 1.0;
      // console.log("moving...");
    }
    if(sPressed) {
      velocity[1] -= 1.0;
      // console.log("moving...");
    }
    if(dPressed) {
      velocity[0] -= 1.0;
      // console.log("moving...");
    }
    let newPos: vec2 = vec2.fromValues(0,0);
    vec2.add(newPos, velocity, planePos);
    terrain.setPlanePos(newPos);
    planePos = newPos;
    // console.log(planePos[0] + ", " + planePos[1]);
  }

  // render textures
  const tcanvas = <HTMLCanvasElement> document.getElementById('texturecanvas');
  const textureRenderer = new TextureRenderer(tcanvas);
  textureRenderer.setClearColor(164.0 / 255.0, 233.0 / 255.0, 1.0, 1.0);
  textureRenderer.setSize(2000, 1000);
  // canvas.width, canvas.height

  // get height data
  texture.setMap(0);
  let heightData: Uint8Array = textureRenderer.renderTexture(camera, texture, [screenQuad]);
  let heightTexture: TextureReader = new TextureReader(heightData, 2000, 1000);

  // get land and water data
  texture.setMap(1);
  let landWaterData: Uint8Array = textureRenderer.renderTexture(camera, texture, [screenQuad]);
  let landWaterTexture: TextureReader = new TextureReader(landWaterData, 2000, 1000);

  // get population density data
  texture.setMap(2);
  let populationData: Uint8Array = textureRenderer.renderTexture(camera, texture, [screenQuad]);
  let populationTexture: TextureReader = new TextureReader(populationData, 2000, 1000);

  lsystem = new LSystem(heightTexture, landWaterTexture, populationTexture, 
                                     popThres, maxBranch, gsize);

  citygrid = new CityGrid(2000, 1000, heightTexture, landWaterTexture, populationTexture,
                                      numBuild, maxBHeight, bWidth);

  // Initial call to load scene
  loadScene();
  loadCity();

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    building.setTime(time);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    if (map != controls.Map) {
      map = controls.Map;
      flat.setMap(map);
    }
    if (popThres != controls.PopulationThreshold) {
      popThres = controls.PopulationThreshold;
      lsystem.reset(popThres, maxBranch, gsize);
      lsystem.setPopulationThreshold(popThres);
      loadScene();
      loadCity();
    }
    if (maxBranch != controls.MaxNumBranches) {
      maxBranch = controls.MaxNumBranches;
      lsystem.reset(popThres, maxBranch, gsize);
      lsystem.setNumRays(maxBranch);
      loadScene();
      loadCity();
    }
    if (gsize != controls.GridSize) {
      gsize = controls.GridSize;
      lsystem.reset(popThres, maxBranch, gsize);
      lsystem.setGridSize(gsize);
      loadScene();
      loadCity();
    }
    if (numBuild != controls.NumBuildings) {
      numBuild = controls.NumBuildings;
      citygrid.setNumBuildings(numBuild);
      loadCity();
    }
    if (maxBHeight != controls.MaxBuildingHeight) {
      maxBHeight = controls.MaxBuildingHeight;
      citygrid.setMaxHeight(maxBHeight);
      loadCity();
    }
    if (bWidth != controls.BuildingWidth) {
      bWidth = controls.BuildingWidth;
      citygrid.setBuildingWidth(bWidth);
      loadCity();
    }

    renderer.clear();
    processKeyPresses();
    renderer.render(camera, terrain, [plane]);
    renderer.render(camera, sky, [screenQuad]);
    renderer.render(camera, instancedShader, [square]);
    renderer.render(camera, building, [cube]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    // textureRenderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  // textureRenderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);
  
  // Start the render loop
  tick();
}

main();
