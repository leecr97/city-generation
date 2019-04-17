import TextureReader from "./texturereader";
import Edge from "./Edge";
import { vec2, vec3, mat4, quat } from "gl-matrix";

export default class CityGrid {
    width: number;
    height: number;
    heightData: TextureReader;
    landWaterData: TextureReader;
    populationData: TextureReader;
    
    grid: number[][] = [];
    buildings: vec2[] = [];
    buildingData: mat4[] = [];

    // gui stuff
    numBuildings: number;
    maxHeight: number;
    buildingWidth: number;

    constructor(w: number, h: number, height: TextureReader, water: TextureReader, popul: TextureReader, nb: number, mh: number, bw: number) {
        this.width = w;
        this.height = h;
        this.heightData = height;
        this.landWaterData = water;
        this.populationData = popul;
        this.numBuildings = nb;
        this.maxHeight = mh;
        this.buildingWidth = bw;
    }

    create(edges: Edge[]) {
        // clear 
        this.grid = [];
        this.buildings = [];
        this.buildingData = [];

        for (let i: number = 0; i < this.width; i++) {
            let newCol: number[] = [];
            for (let j: number = 0; j < this.height; j++) {
                newCol.push(0);
            }
            this.grid.push(newCol);
        }

        this.rasterize(edges);
        this.placeBuildingPoints(this.numBuildings);
        this.makeBuildings();
    }

    setNumBuildings(nb: number) {
        this.numBuildings = nb;
    }

    setMaxHeight(mh: number) {
        this.maxHeight = mh;
    }

    setBuildingWidth(bw: number) {
        this.buildingWidth = bw;
    }

    slope(p1: vec2, p2: vec2) {
        return (p2[1] - p1[1]) / (p2[0] - p1[0]);
    }

    onLand(x: number, y: number): boolean {
        let land: number = this.landWaterData.getData(x, y);
        if (land > 0.26) {
            return true;
        }
        else return false;
    }

    rasterize(edges: Edge[]) {

        // rasterize roads
        for (let i: number = 0; i < edges.length; i++) {
            let e: Edge = edges[i];

            let points: vec2[] = e.getPoints();
            // console.log(points.length);

            for (let j: number = 0; j < points.length; j++) {
                let pt: vec2 = points[j];
                if (this.heightData.boundsCheck(pt[0], pt[1])) {
                    this.grid[pt[0]][pt[1]] = 1;
                }
            }
            
        }

        // rasterize water
        for (let x: number = 0; x < this.width; x++) {
            for (let y: number = 0; y < this.height; y++) {
                let land: boolean = this.onLand(x, y);
                if (!land) {
                    this.grid[x][y] = 2;
                }
            }
        }

    }

    convertPos(x: number, y: number): vec2 {
        let o1: vec2 = vec2.fromValues(0, 2000);
        let o2: vec2 = vec2.fromValues(0, 1000);
        let n1: vec2 = vec2.fromValues(0, 1200);
        let n2: vec2 = vec2.fromValues(0, 850);

        let x2: number = (x - o1[0]) * ((n1[1] - n1[0]) / (o1[1] - o1[0])) + n1[0];
      
        let y2: number = (y - o2[0]) * ((n2[1] - n2[0]) / (o2[1] - o2[0])) + n2[0];

        return vec2.fromValues(x2, y2);
    }

    placeBuildingPoints(numBuildings: number) {
        let buildingsToPlace: number = numBuildings;
        let radius: number = 2;
        while (buildingsToPlace > 0) {
            let randx = Math.floor(this.width * Math.random());
            let randy = Math.floor(this.height * Math.random());
            // console.log("r: " + randx + ", " + randy);
            let scaledPos: vec2 = this.convertPos(randx, randy);
            randx = Math.floor(scaledPos[0]);
            randy = Math.floor(scaledPos[1]);

            let valid: boolean = true;

            for (let x: number = (randx - radius); x < (randx + radius + 1); x++) {
                for (let y: number = (randy - radius); y < (randy + radius + 1); y++) {
                    if (this.heightData.boundsCheck(x, y)) {
                        if (this.grid[x][y] != 0) {
                            valid = false;
                            break;
                        }
                    }
                }
            }

            if (valid) {
                this.buildings.push(vec2.fromValues(randx, randy));
                for (let x: number = (randx - radius); x < (randx + radius + 1); x++) {
                    for (let y: number = (randy - radius); y < (randy + radius + 1); y++) {
                        if (this.heightData.boundsCheck(x, y)) {
                            this.grid[x][y] = 3;
                        }
                    }
                }
            }
            buildingsToPlace--;
        }
    }

    makeBuildings() {
        let layerHeight: number = 5.0;

        for (let i: number = 0; i < this.buildings.length; i++) {
            let currPt: vec2 = this.buildings[i];

            // height based on population density
            let popul: number = this.populationData.getData(currPt[0], currPt[1]);
            let currHeight: number = this.maxHeight * popul;
            let width: number = this.buildingWidth;

            // first layer
            let first = new BuildingLayer(currPt, currHeight, layerHeight, width);
            this.buildingData.push(first.getTransformation());
            currHeight -= layerHeight;

            // extrude layers downwards
            while (currHeight > 0) {
                let jitterx = Math.floor(10.0 * Math.random());
                let jittery = Math.floor(10.0 * Math.random());
                let newPt: vec2 = vec2.create();
                vec2.add(newPt, currPt, vec2.fromValues(jitterx, jittery));
                let newLayer = new BuildingLayer(newPt, currHeight, layerHeight, width);
                this.buildingData.push(newLayer.getTransformation());
                currHeight -= layerHeight;
            }
        }
    }

}

class BuildingLayer {
    loc: vec2;
    ypos: number;
    height: number;
    sideLength: number;

    constructor(l: vec2, y: number, h: number, w: number) {
        this.loc = l;
        this.ypos = y;
        this.height = h;
        this.sideLength = w;
    }

    convertPos(pos: vec2): vec2 {
        let x: number = pos[0];
        let x2: number = x * (-300.0 / 2000.0) + 150.0;
      
        let y: number = pos[1];
        let y2: number = y * (150.0 / 1000.0) - 75.0;

        return vec2.fromValues(x2, y2);
    }

    getTransformation(): mat4 {
        let scaledPos: vec2 = this.convertPos(this.loc);
        let translate: vec3 = vec3.fromValues(scaledPos[0], this.ypos, scaledPos[1]);
        
        let axis: vec3 = vec3.fromValues(0,0,1);
        let angle: number = 0.0;
        
        let rotation: quat = quat.create();
        quat.setAxisAngle(rotation, axis, angle);
        let r: mat4 = mat4.create();
        mat4.fromQuat(r, rotation);

        let scale: vec3 = vec3.fromValues(this.sideLength, this.height, this.sideLength);

        let transform: mat4 = mat4.create();
        mat4.fromRotationTranslationScale(transform, rotation, translate, scale);
        return transform;
    }
}