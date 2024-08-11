import { MAT4x4_BYTE_LENGTH, VEC4_BYTE_LENGTH } from "../const";
import { engine, GraphicsShader, EngineEventListener } from ".";
import { PointLight, DirectLight } from "../components";

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
            label: 'Scene bind group layout',
            entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
                { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
            ]
        });
        this.sceneShaderData = new SceneShaderData(this.device, this.sceneBindGroupLayout);

        this.meshBindGroupLayout = this.device.createBindGroupLayout({
            label: 'Mesh bind group layout',
            entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } }
            ]
        });

        this.depthTexture = this.createDepthTexture();
    }

    override async setup() {
        this.shader = await engine.shaderFactory.createGraphicsShader("shaders/base.wgsl");
    }

    render() {
        const {
            meshes, directLights, pointLights
        } = engine.scene.getSceneComponents();

        this.sceneShaderData.write(directLights, pointLights);

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                // clearValue: [0.3, 0.3, 0.3, 1],
                clearValue: [53/255, 68/255, 161/255, 1],
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
    private readonly directLightsBuffer: GPUBuffer;
    private readonly pointLightsBuffer: GPUBuffer;

    private readonly DIRECT_LIGHTS_MAX_NUM = 10;
    private readonly POINT_LIGHTS_MAX_NUM = 100;

    private readonly DIRECT_LIGHT_SIZE = (3 + 1 + 3 + 1) * 4;
    private readonly POINT_LIGHT_SIZE = (3 + 1 + 3 + 1) * 4;

    constructor(device: GPUDevice, layout: GPUBindGroupLayout) {
        this.device = device;

        this.cameraBuffer = device.createBuffer({
            size: MAT4x4_BYTE_LENGTH * 2 + VEC4_BYTE_LENGTH,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.directLightsBuffer = device.createBuffer({
            size: this.DIRECT_LIGHTS_MAX_NUM * this.DIRECT_LIGHT_SIZE,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })

        this.pointLightsBuffer = device.createBuffer({
            size: this.POINT_LIGHTS_MAX_NUM * this.POINT_LIGHT_SIZE,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })

        this.bindGroup = device.createBindGroup({
            label: 'Scene shader data',
            layout,
            entries: [
                { binding: 0, resource: { buffer: this.cameraBuffer } },
                { binding: 1, resource: { buffer: this.directLightsBuffer } },
                { binding: 2, resource: { buffer: this.pointLightsBuffer } }
            ]
        });
    }

    write(directLights: DirectLight[], pointLights: PointLight[]) {
        this.writeCamera();
        this.writeDirectLights(directLights);
        this.writePointLights(pointLights);
    }

    private writeCamera() {
        const camera = engine.scene.mainCamera;

        this.device.queue.writeBuffer(this.cameraBuffer, 0, camera.getViewMatrix());
        this.device.queue.writeBuffer(this.cameraBuffer, MAT4x4_BYTE_LENGTH, camera.getProjectionMatrix());
        this.device.queue.writeBuffer(this.cameraBuffer, MAT4x4_BYTE_LENGTH * 2, camera.transform.position);
    }

    private writeDirectLights(lights: DirectLight[]) {
        const data = new Float32Array(lights.length * this.DIRECT_LIGHT_SIZE);

        for(let i=0; i < lights.length; i++) {
            const light = lights[i];
            const offset = i * this.DIRECT_LIGHT_SIZE;
            const direction = light.transform.getDirection();

            data.set([...light.color, light.intensity, ...direction], offset);
        }

        this.device.queue.writeBuffer(this.directLightsBuffer, 0, data);
    }

    private writePointLights(lights: PointLight[]) {

    }
}
