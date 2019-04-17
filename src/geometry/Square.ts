import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Square extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  offsets: Float32Array; // Data for bufTranslate

  col1: Float32Array;
  col2: Float32Array;
  col3: Float32Array;
  col4: Float32Array;

  constructor() {
    super(); // Call the constructor of the super class. This is required.
  }

  create() {

  this.indices = new Uint32Array([0, 1, 2,
                                  0, 2, 3]);
  this.positions = new Float32Array([-0.5, -0.5, 0, 1,
                                     0.5, -0.5, 0, 1,
                                     0.5, 0.5, 0, 1,
                                     -0.5, 0.5, 0, 1]);

    this.generateIdx();
    this.generatePos();
    this.generateCol();
    // this.generateTranslate();

    this.generateTransform1();
    this.generateTransform2();
    this.generateTransform3();
    this.generateTransform4();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created square`);
  }

  // setInstanceVBOs(offsets: Float32Array, colors: Float32Array) {
  //   this.colors = colors;
  //   this.offsets = offsets;

  //   gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
  //   gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
  //   gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
  //   gl.bufferData(gl.ARRAY_BUFFER, this.offsets, gl.STATIC_DRAW);
  // }

  setInstanceVBOs(colors: Float32Array, col1: Float32Array, col2: Float32Array, col3: Float32Array, col4: Float32Array) {
    this.colors = colors;
    this.col1 = col1;
    this.col2 = col2;
    this.col3 = col3;
    this.col4 = col4;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform1);
    gl.bufferData(gl.ARRAY_BUFFER, this.col1, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform2);
    gl.bufferData(gl.ARRAY_BUFFER, this.col2, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform3);
    gl.bufferData(gl.ARRAY_BUFFER, this.col3, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform4);
    gl.bufferData(gl.ARRAY_BUFFER, this.col4, gl.STATIC_DRAW);
  }
};

export default Square;