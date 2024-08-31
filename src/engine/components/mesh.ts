import { Component } from ".";
import { engine, GraphicsShader } from "../core";
import { Material } from "../resources";
import { MeshShaderData } from "../core/renderer/mesh-renderer";

export class Mesh extends Component {
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
