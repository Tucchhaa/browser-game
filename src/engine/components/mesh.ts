import { Component } from "./component";
import { GraphicsShader } from "../core/shader";
import { engine } from "../core/engine";
import { Material } from "../resources/material";
import { MAT4x4_BYTE_LENGTH, VEC4_BYTE_LENGTH } from "../const";

class MeshShaderData {
    readonly bindGroup: GPUBindGroup;
    private readonly mesh: MeshComponent;

    private readonly transformBuffer: GPUBuffer;
    private readonly materialBuffer: GPUBuffer;

    constructor(mesh: MeshComponent) {
        this.mesh = mesh;

        this.transformBuffer = engine.device.createBuffer({
            size: MAT4x4_BYTE_LENGTH,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.materialBuffer = engine.device.createBuffer({
            size: VEC4_BYTE_LENGTH * 3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.bindGroup = engine.device.createBindGroup({
            layout: engine.renderer.meshBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.transformBuffer } },
                { binding: 1, resource: { buffer: this.materialBuffer } }
            ]
        });
    }

    write() {
        engine.device.queue.writeBuffer(this.transformBuffer, 0, this.mesh.transform.getMatrix());

        engine.device.queue.writeBuffer(this.materialBuffer, 0, this.mesh.material.Kd);
        engine.device.queue.writeBuffer(this.materialBuffer, VEC4_BYTE_LENGTH, this.mesh.material.Ks);
        engine.device.queue.writeBuffer(this.materialBuffer, VEC4_BYTE_LENGTH*2, this.mesh.material.Ka);
    }
}

export class MeshComponent extends Component {
    shader: GraphicsShader | null;
    shaderData: MeshShaderData;
    material: Material;
    readonly vertexBuffer: GPUBuffer;
    readonly vertexCount: number;


    constructor(vertexData: Float32Array, label = "") {
        super();

        this.shader = null;
        this.shaderData = new MeshShaderData(this);
        this.material = new Material({});

        this.vertexCount = vertexData.byteLength / 8 / 4;
        this.vertexBuffer = engine.device.createBuffer({
            label,
            size: vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        engine.device.queue.writeBuffer(this.vertexBuffer, 0, vertexData);
    }
}
