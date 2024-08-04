import {GraphicsShader} from "../../shader";
import {engine} from "../../engine";
import {Component} from "./component";

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
