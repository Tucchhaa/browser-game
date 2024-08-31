import { Mat4, mat4, vec3 } from "wgpu-matrix";

import { Component } from ".";
import { engine } from "../core";

export class Camera extends Component {
    readonly far: number;
    readonly near: number;
    readonly fov: number;

    private screenWidth: number;
    private screenHeight: number;

    private resizeObserver: ResizeObserver;
    private aspect: number;

    private projectionMatrix: Mat4;
    
    constructor(far: number = 100.0, near: number = 0.1, fov: number = Math.PI * 2 /5) {
        super();

        const that = this;
        this.far = far;
        this.near = near;
        this.fov = fov;

        this.projectionMatrix = this.calcProjectionMatrix();

        this.resizeObserver = new ResizeObserver(resize);
        this.resizeObserver.observe(engine.canvas);

        resize();

        function resize() {
            that.setScreenSizes(engine.canvas.width, engine.canvas.height);
        }
    }

    getViewMatrix() {
        let result = mat4.fromQuat(this.transform.rotation);

        result = mat4.translate(result, vec3.negate(this.transform.position));

        return result;
    }

    getProjectionMatrix() {
        return this.projectionMatrix;
    }

    getAspect() {
        return this.aspect;
    }

    private setScreenSizes(width: number, height: number) {
        this.screenWidth = width;
        this.screenHeight = height;

        this.aspect = this.screenWidth / this.screenHeight;

        this.projectionMatrix = this.calcProjectionMatrix();
    }

    private calcProjectionMatrix() {
        return mat4.perspective(this.fov, this.aspect, this.near, this.far);
    }
}