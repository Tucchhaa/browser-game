import {Component} from "./component";
import {mat4, quat, Quat, Vec2, vec3, Vec3} from "wgpu-matrix";

export class Transform extends Component {
    private _position: Vec3 = vec3.zero();
    private _rotation: Quat = quat.identity();
    private _scale: Vec3 = vec3.create(1, 1, 1);

    get position() { return this._position; }
    get rotation() { return this._rotation; }
    get scale() { return this._scale; }

    constructor() {
        super();
    }

    getMatrix() {
        let result = mat4.identity();

        result = mat4.translate(result, this._position);
        result = mat4.mul(result, mat4.fromQuat(this._rotation));
        result = mat4.scale(result, this._scale);

        return result;
    }

    translate(v: Vec3) {
        this._position = vec3.add(this._position, v);
    }

    rotate(q: Quat) {
        this._rotation = quat.mul(this._rotation, q);
    }

    scaleBy(v: Vec3) {
        this._scale = vec3.mul(this._scale, v);
    }
}