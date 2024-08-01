import {Entity} from "./entity";
import {engine} from "./engine";
import {GraphicsShader} from "./shader";

export class Renderer extends Entity {
    device: GPUDevice;
    shader: GraphicsShader;

    constructor(device: GPUDevice) {
        super();

        this.device = device;
    }

    override async setup() {
        this.shader = await engine.shaderFactory.createGraphicsShader("base.wgsl");
    }

    render() {
        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                clearValue: [0.3, 0.3, 0.3, 1],
                loadOp: 'clear',
                storeOp: 'store',
                view : engine.ctx.getCurrentTexture().createView()
            }]
        };

        const encoder = this.device.createCommandEncoder();

        const pass = encoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(this.shader.pipeline);
        pass.draw(3);
        pass.end();

        const commandBuffer = encoder.finish();
        this.device.queue.submit([commandBuffer]);
    }
}