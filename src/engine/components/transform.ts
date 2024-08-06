import {Component} from "./component";
import {mat4, quat, Quat, Vec2, vec3, Vec3} from "wgpu-matrix";

export class Transform extends Component {
    position: Vec3 = vec3.zero();
    rotation: Quat = quat.identity();
    scale: Vec3 = vec3.create(1, 1, 1);

    getMatrix() {
        let result = mat4.identity();

        result = mat4.translate(result, this.position);
        result = mat4.mul(result, mat4.fromQuat(this.rotation));
        result = mat4.scale(result, this.scale);

        return result;
    }

    translate(v: Vec3) {
        this.position = vec3.add(this.position, v);
    }

    rotate(q: Quat) {
        this.rotation = quat.mul(this.rotation, q);
    }

    scaleBy(v: Vec3) {
        this.scale = vec3.mul(this.scale, v);
    }
}