import { vec3, Vec3 } from "wgpu-matrix";

import { Component } from "..";

export class DirectLight extends Component {
    public color: Vec3;
    public intensity: number;

    constructor(color?: Vec3, intensity?: number) {
        super();

        this.color = color ?? vec3.create(1, 1, 1);
        this.intensity = intensity ?? 1.0;
    }
}