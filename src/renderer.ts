import {Entity} from "./entity";
import {engine} from "./engine";
import {GraphicsShader} from "./shader";
import {mat4, Mat4} from "wgpu-matrix";
import {MeshComponent} from "./engine/components/mesh";
import {CameraComponent} from "./engine/components/camera";

export class Renderer extends Entity {
    device: GPUDevice;
    shader: GraphicsShader;

    constructor(device: GPUDevice) {
        super();

        this.device = device;
    }

    camera: CameraComponent;

    override async setup() {
        this.shader = await engine.shaderFactory.createGraphicsShader("base.wgsl");

        const cameraObject = engine.tree.spawnGameObject();
        this.camera = new CameraComponent(window.outerWidth, window.outerHeight);
        cameraObject.components.add(this.camera);
    }

    render() {
        const perspective = this.camera.getViewProjectionMatrix();

        const uniformBuffer = this.device.createBuffer({
            size: perspective.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        this.device.queue.writeBuffer(uniformBuffer, 0, perspective);

        const bindGroup = this.device.createBindGroup({
            layout: this.shader.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: uniformBuffer } }
            ]
        });

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                clearValue: [0.3, 0.3, 0.3, 1],
                loadOp: 'clear',
                storeOp: 'store',
                view : engine.ctx.getCurrentTexture().createView()
            }],
        };

        const meshes = []
        const q = [engine.tree.getRoot()];

        while(q.length) {
            const n = q[0]
            q.shift()

            if(n.components.get(MeshComponent)) {
                meshes.push(n.components.get(MeshComponent));
            }

            q.push(...engine.tree.getChildren(n));
        }
        const mesh = meshes[0];

        const encoder = this.device.createCommandEncoder();

        const pass = encoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(this.shader.pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.setVertexBuffer(0, mesh.vertexBuffer);
        pass.draw(mesh.vertexCount);
        pass.end();

        const commandBuffer = encoder.finish();

        this.device.queue.submit([commandBuffer]);
    }
}