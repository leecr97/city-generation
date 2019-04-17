import { vec2, vec3, mat4, quat, mat2 } from "gl-matrix";

export default class Edge {
    leftPt: vec3;
    rightPt: vec3;
    isHighway: boolean;
    xoffset: number = 850;
    yoffset: number = 530;

    constructor(p1: vec2, p2: vec2, isHighway: boolean) {
        // console.log(p1[0] + ", " + p2[0]);
        let p1o: vec3 = vec3.fromValues(p1[0] - this.xoffset, p1[1] - this.yoffset, 0);
        let p2o: vec3 = vec3.fromValues(p2[0] - this.xoffset, p2[1] - this.yoffset, 0);
        
        // if (vec3.distance(vec3.fromValues(-this.xoffset,-this.yoffset,0), p1o) 
        //     > vec3.distance(vec3.fromValues(-this.xoffset,-this.yoffset,0), p2o)) {
        //     this.leftPt = p1o;
        //     this.rightPt = p2o;
        // }

        if (p1o[0] > p2o[0])  {
            this.leftPt = p1o;
            this.rightPt = p2o;
        }
        else {
            this.leftPt = p2o;
            this.rightPt = p1o;
        }
        // console.log(this.leftPt[0] + ", " + this.rightPt[0]);
        this.isHighway = isHighway;
    }

    getLeftPoint() {
        return vec2.fromValues(this.leftPt[0] + this.xoffset, this.leftPt[1] + this.yoffset);
    }

    getRightPoint() {
        return vec2.fromValues(this.rightPt[0] + this.xoffset, this.rightPt[1] + this.yoffset);
    }

    slope(p1: vec2, p2: vec2): number {
        let den: number = p2[0] - p1[0];
        if (den == 0) {
            den = 0.000001;
        }
        return (p2[1] - p1[1]) / den;
    }

    within(testPt: vec2, p1: vec2, p2: vec2): boolean {
        if (testPt[0] >= p1[0] && testPt[0] <= p2[0] &&
            testPt[1] >= p1[1] && testPt[1] <= p2[1]) {
            return true;
        }
        else return false;
    }

    getPoints(): vec2[] {
        let points: vec2[] = [];

        let p1: vec2 = this.getLeftPoint();
        let p2: vec2 = this.getRightPoint();
        let width: number = this.isHighway ? 10 : 3;
        let w2: number = width / 2.0;
        let slope: number = this.slope(p1, p2);

        let theta: number = Math.atan(slope);
        let rot: mat2 = mat2.fromValues(Math.cos(theta), Math.sin(theta), 
                                        Math.sin(theta) * -1, Math.cos(theta));

        let t: number = vec2.distance(p1, p2);
        let min: vec2 = vec2.fromValues(-1.0 * t / 2.0, -1.0 * w2);
        let max: vec2 = vec2.fromValues(t / 2.0, w2);

        let d: vec2 = vec2.create();
        vec2.subtract(d, p2, p1);
        let transvec: vec2 = vec2.create();
        vec2.scale(transvec, d, t / 2.0);
        vec2.add(transvec, p1, transvec);

        let newmin: vec2 = vec2.create();
        vec2.transformMat2(newmin, min, rot);
        vec2.multiply(newmin, transvec, newmin);

        let newmax: vec2 = vec2.create();
        vec2.transformMat2(newmax, max, rot);
        vec2.multiply(newmax, transvec, newmax);

        let ymax: number = Math.max(p1[1], p2[1]);
        let ymin: number = Math.min(p1[1], p2[1]);
        for (let x: number = Math.floor(p1[0] - w2); x <= Math.floor(p2[0] + w2); x++) {
            for (let y: number = Math.floor(ymin - w2); y <= Math.floor(ymax + w2); y++) {
                let newPt: vec2 = vec2.fromValues(x,y);
                if (this.within(newPt, newmin, newmax)) {
                    points.push(newPt);
                }
            }
        }

        return points;
    }

    findAngle(v1: vec3, v2: vec3) : number {
        let l1: number = vec3.length(v1);
        let l2: number = vec3.length(v2);
        let dot: number = vec3.dot(v1, v2);

        return Math.acos(dot / (l1 * l2));
    }

    getTransformation(): mat4 {       
        // calculate translate - midpoint of edge
        let midx = (this.leftPt[0] + this.rightPt[0]) / 2;
        let midy = (this.leftPt[1] + this.rightPt[1]) / 2;
        let midz = (this.leftPt[2] + this.rightPt[2]) / 2;
        let translate: vec3 = vec3.fromValues(midx, midy, midz);
        vec3.scale(translate, translate, 0.175);
        // vec3.subtract(translate, translate, vec3.fromValues(0.0, 0.0, -0.1));
        let t: mat4 = mat4.create();
        mat4.fromTranslation(t, translate);

        // calculate rotate - quat of angle from y-axis
        let axis: vec3 = vec3.fromValues(0,0,1);
        let direction: vec3 = vec3.create();
        vec3.subtract(direction, this.rightPt, this.leftPt);
        let angle: number = this.findAngle(vec3.fromValues(0,1,0), direction);
        
        let rotation: quat = quat.create();
        quat.setAxisAngle(rotation, axis, angle);
        let r: mat4 = mat4.create();
        mat4.fromQuat(r, rotation);
        
        // scale
        let scaleX: number = this.isHighway ? 10 : 3;
        let scale: vec3 = vec3.fromValues(scaleX, vec3.length(direction), 1);
        vec3.scale(scale, scale, 0.175);
        let s: mat4 = mat4.create();
        mat4.fromScaling(s, scale);

        let transform: mat4 = mat4.create();
        mat4.fromRotationTranslationScale(transform, rotation, translate, scale);
        let rmatx: mat4 = mat4.create();
        mat4.rotateX(rmatx, rmatx, (Math.PI / -2.0));
        mat4.multiply(transform, rmatx, transform);
        let rmaty: mat4 = mat4.create();
        mat4.rotateY(rmaty, rmaty, Math.PI);
        mat4.multiply(transform, rmaty, transform);
	    return transform;
    }
}