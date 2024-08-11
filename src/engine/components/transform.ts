import { mat4, quat, Quat, Vec3, vec3 } from "wgpu-matrix";

import { Component } from ".";

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

    translate(v: Vec3, transform?: Transform): void {
        const { rotation } = transform ?? this;

        // (v as Float32Array)[2] = -(v as Float32Array)[2]!;

        const rotatedVector = vec3.transformQuat(v, quat.conjugate(rotation));

        this.position = vec3.add(this.position, rotatedVector);
    }

    rotate(q: Quat, transform?: Transform): void {
        if(transform && transform !== this) {
            const relativeRotation = quat.mul(quat.mul(transform.rotation, q), quat.conjugate(transform.rotation));

            this.rotation = quat.mul(relativeRotation, this.rotation);

        } else {
            this.rotation = quat.mul(this.rotation, q);
        }
    }

    scaleBy(v: Vec3) {
        this.scale = vec3.mul(this.scale, v);
    }

    getDirection(): Vec3 {
        return vec3.transformQuat(vec3.create(0, 0, -1), this.rotation);
    }
}

export const WorldTransform = new Transform();