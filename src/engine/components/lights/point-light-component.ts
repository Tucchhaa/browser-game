import { Component } from "../component";
import { vec3, Vec3 } from "wgpu-matrix";

export class PointLightComponent extends Component {
    public color: Vec3;
    public intensity: number;
    public range: number;

    constructor(color?: Vec3, intensity?: number, range?: number) {
        super();

        this.color = color ?? vec3.create(1, 1, 1);
        this.intensity = intensity ?? 1.0;
        this.range = range ?? 10.0;
    }
}