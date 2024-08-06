import {Component} from "./component";
import {mat4, vec3} from "wgpu-matrix";
import {engine} from "../../engine";

export class CameraComponent extends Component {
    far: number;
    near: number;
    fov: number;

    screenWidth!: number;
    screenHeight!: number;

    private resizeObserver: ResizeObserver;
    private aspect!: number;
    
    constructor(far: number = 100.0, near: number = 0.1, fov: number = Math.PI * 2 /5) {
        super();

        const that = this;
        this.far = far;
        this.near = near;
        this.fov = fov;

        this.resizeObserver = new ResizeObserver(resize);
        this.resizeObserver.observe(engine.canvas);

        resize();

        function resize() {
            that.setScreenSizes(engine.canvas.width, engine.canvas.height);
        }
    }

    private setScreenSizes(width: number, height: number) {
        this.screenWidth = width;
        this.screenHeight = height;

        this.aspect = this.screenWidth / this.screenHeight;
    }

    getViewMatrix() {
        let result = mat4.identity();

        result = mat4.mul(result, mat4.fromQuat(this.transform.rotation));
        result = mat4.translate(result, vec3.negate(this.transform.position));

        return result;
    }

    getViewProjectionMatrix() {
        const perspectiveMatrix = mat4.perspective(
            this.fov, this.aspect, this.near, this.far,
        );

        const viewMatrix = this.getViewMatrix();

        return mat4.multiply(perspectiveMatrix, viewMatrix);
    }
}