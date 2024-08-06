import { MAT4x4_BYTE_LENGTH, VEC4_BYTE_LENGTH } from "../const";
import { engine } from "./engine";
import { Entity } from "./entity";
import { GraphicsShader } from "./shader";
import { CameraComponent } from "../components/camera";
import { CharacterController } from "../components/character-controller";
import { MeshComponent } from "../components/mesh";


class SceneBindGroup {
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
        const camera = engine.renderer.camera;

        this.device.queue.writeBuffer(this.cameraBuffer, 0, camera.getViewMatrix());
        this.device.queue.writeBuffer(this.cameraBuffer, MAT4x4_BYTE_LENGTH, camera.getProjectionMatrix());
        this.device.queue.writeBuffer(this.cameraBuffer, MAT4x4_BYTE_LENGTH * 2, camera.transform.position);
    }
}

export class Renderer extends Entity {
    readonly device: GPUDevice;
    shader: GraphicsShader;

    readonly sceneBindGroupLayout: GPUBindGroupLayout;
    private sceneBindGroup: SceneBindGroup;

    constructor(device: GPUDevice) {
        super();

        this.device = device;

        this.sceneBindGroupLayout = device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {} }
            ]
        });
        this.sceneBindGroup = new SceneBindGroup(device, this.sceneBindGroupLayout);
    }

    camera: CameraComponent;

    override async setup() {
        this.shader = await engine.shaderFactory.createGraphicsShader("base.wgsl");

        const cameraObject = engine.tree.spawnGameObject();
        const controller = new CharacterController();

        this.camera = new CameraComponent();
        cameraObject.components.add(this.camera);
        cameraObject.components.add(controller)
    }

    render() {
        this.sceneBindGroup.write();

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                clearValue: [0.3, 0.3, 0.3, 1],
                loadOp: 'clear',
                storeOp: 'store',
                view : engine.ctx.getCurrentTexture().createView()
            }],
        };

        const meshes = this.getMeshes();

        const encoder = this.device.createCommandEncoder();

        const pass = encoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(this.shader.pipeline);
        pass.setBindGroup(0, this.sceneBindGroup.bindGroup);

        for(const mesh of meshes) {
            pass.setVertexBuffer(0, mesh.vertexBuffer);
            pass.draw(mesh.vertexCount);
        }

        pass.end();

        const commandBuffer = encoder.finish();

        this.device.queue.submit([commandBuffer]);
    }

    private getMeshes() {
        const result = [];

        engine.tree.applyToAll(gameObject => {
            const mesh = gameObject.components.getOptional(MeshComponent);

            if(mesh)
                result.push(mesh);
        });

        return result;
    }
}
