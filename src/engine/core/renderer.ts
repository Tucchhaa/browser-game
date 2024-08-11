import { MAT4x4_BYTE_LENGTH, VEC4_BYTE_LENGTH } from "../const";
import { engine } from "./engine";
import { EngineEventListener } from "./engineEventListener";
import { GraphicsShader } from "./shader";

export class Renderer extends EngineEventListener {
    readonly device: GPUDevice;
    shader: GraphicsShader;

    readonly sceneBindGroupLayout: GPUBindGroupLayout;
    readonly meshBindGroupLayout: GPUBindGroupLayout;

    private sceneShaderData: SceneShaderData;

    private depthTexture: GPUTexture;

    constructor() {
        super();

        this.device = engine.device;

        this.sceneBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {} }
            ]
        });
        this.sceneShaderData = new SceneShaderData(this.device, this.sceneBindGroupLayout);

        this.meshBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {} },
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: {} }
            ]
        });

        this.depthTexture = this.createDepthTexture();
    }

    override async setup() {
        this.shader = await engine.shaderFactory.createGraphicsShader("shaders/base.wgsl");
    }

    render() {
        this.sceneShaderData.write();

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                clearValue: [0.3, 0.3, 0.3, 1],
                loadOp: 'clear',
                storeOp: 'store',
                view : engine.ctx.getCurrentTexture().createView()
            }],
            depthStencilAttachment: {
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
                view: this.depthTexture.createView()
            }
        };

        const { meshes } = engine.scene.getSceneComponents();
        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginRenderPass(renderPassDescriptor);

        pass.setPipeline(this.shader.pipeline);
        pass.setBindGroup(0, this.sceneShaderData.bindGroup);

        for(const mesh of meshes) {
            mesh.shaderData.write();

            pass.setBindGroup(1, mesh.shaderData.bindGroup)
            pass.setVertexBuffer(0, mesh.vertexBuffer);

            pass.draw(mesh.vertexCount);
        }

        pass.end();

        const commandBuffer = encoder.finish();

        this.device.queue.submit([commandBuffer]);
    }

    onResize() {
        this.depthTexture.destroy();
        this.depthTexture = this.createDepthTexture();
    }

    private createDepthTexture() {
        const canvasTexture = engine.ctx.getCurrentTexture();

        return this.device.createTexture({
            size: [canvasTexture.width, canvasTexture.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
    }
}

class SceneShaderData {
    readonly device: GPUDevice;
    readonly bindGroup: GPUBindGroup;

    private readonly cameraBuffer: GPUBuffer;

    constructor(device: GPUDevice, layout: GPUBindGroupLayout) {
        this.device = device;

        this.cameraBuffer = device.createBuffer({
            size: MAT4x4_BYTE_LENGTH * 2 + VEC4_BYTE_LENGTH,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.bindGroup = device.createBindGroup({
            layout,
            entries: [
                { binding: 0, resource: { buffer: this.cameraBuffer } }
            ]
        });
    }

    write() {
        const camera = engine.scene.mainCamera;

        this.device.queue.writeBuffer(this.cameraBuffer, 0, camera.getViewMatrix());
        this.device.queue.writeBuffer(this.cameraBuffer, MAT4x4_BYTE_LENGTH, camera.getProjectionMatrix());
        this.device.queue.writeBuffer(this.cameraBuffer, MAT4x4_BYTE_LENGTH * 2, camera.transform.position);
    }
}
