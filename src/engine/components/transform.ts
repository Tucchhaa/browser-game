import { Mat4, mat4, quat, Quat, Vec3, vec3 } from "wgpu-matrix";

import { Component } from ".";

export class Transform extends Component {
    private _changed: boolean;

    private parentAbsolutePosition: Vec3;
    private parentAbsoluteRotation: Quat;
    private parentAbsoluteScale: Vec3;

    private _position: Vec3;
    private _rotation: Quat;
    private _scale: Vec3;

    private transformMatrix: Mat4;
    private direction: Vec3;

    constructor() {
        super();        

        this._changed = false;

        this.parentAbsolutePosition = this._position = vec3.zero();
        this.parentAbsoluteRotation = this._rotation = quat.identity();
        this.parentAbsoluteScale    = this._scale    = vec3.create(1, 1, 1);
        
        this.transformMatrix = mat4.identity();
        this.direction = vec3.create(0, 0, -1);
    }

    get position() { return this._position; }
    set position(value: Vec3) { this._position = value; this._changed = true; }

    get rotation() { return this._rotation; }
    set rotation(value: Quat) { this._rotation = value; this._changed = true; }

    get scale() { return this._scale; }
    set scale(value: Vec3) { this._scale = value; this._changed = true; }
    
    getAbsolutePosition() { return vec3.add(this.parentAbsolutePosition, this.position); };
    getAbsoluteRotation() { return quat.mul(this.parentAbsoluteRotation, this.rotation); };
    getAbsoluteScale() { return vec3.mul(this.parentAbsoluteScale, this.scale); };
    
    getMatrix() { return this.transformMatrix; }
    getDirection() { return this.direction; }

    updateAbsoluteValues() {
        const parent = this.gameObject.parent?.transform;

        if(parent?._changed) {
            this.parentAbsolutePosition = parent.getAbsolutePosition();
            this.parentAbsoluteRotation = parent.getAbsoluteRotation();
            this.parentAbsoluteScale = parent.getAbsoluteScale();

            this._changed = true;
        }

        if(this._changed) {
            this.recalculate();
        }
    }
    
    recalculate() {
        this.transformMatrix = this.recalculateTransformMatrix();
        this.direction = this.recalculateDirection();
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

    private recalculateTransformMatrix() {
        let result = mat4.translation(this.getAbsolutePosition());

        mat4.mul(result, mat4.fromQuat(this.getAbsoluteRotation()), result);
        mat4.scale(result, this.getAbsoluteScale(), result);

        return result;
    }

    private recalculateDirection() {
        return vec3.transformQuat(vec3.create(0, 0, -1), this.getAbsoluteRotation());
    }
}

export const WorldTransform = new Transform();