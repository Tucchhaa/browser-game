import { Component } from "./component";
import { GraphicsShader } from "../core/shader";
import { engine } from "../core/engine";

export class MeshComponent extends Component {
    shader: GraphicsShader | null;
    vertexBuffer: GPUBuffer;
    vertexCount: number;

    constructor(vertexData: Float32Array, label = "") {
        super();

        this.shader = null;

        this.vertexCount = vertexData.byteLength / 8 / 4;

        this.vertexBuffer = engine.device.createBuffer({
            label,
            size: vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        engine.device.queue.writeBuffer(this.vertexBuffer, 0, vertexData);
    }
}
