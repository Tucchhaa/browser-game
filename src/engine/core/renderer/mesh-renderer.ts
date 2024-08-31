import { engine, GraphicsShader, EngineEventListener, ShaderFactory } from "../index";
import { MAT4x4_BYTE_LENGTH, VEC4_BYTE_LENGTH } from "../../const";
import { Mesh } from "../../components";

export class MeshRenderer extends EngineEventListener {
    private shader: GraphicsShader;
    private colliderShader: GraphicsShader;

    readonly meshDataLayout: GPUBindGroupLayout;

    private depthTexture: GPUTexture;
    private readonly renderPassDescriptor: GPURenderPassDescriptor;

    constructor() {
        super();

        this.meshDataLayout = engine.device.createBindGroupLayout({
            label: 'Mesh shader data',
            entries: [
                // transform
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
                // normalTransform
                { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
                // material
                { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } }
            ]
        });

        this.depthTexture = this.createDepthTexture();

        this.renderPassDescriptor = {
            // @ts-ignore
            colorAttachments: [{
                clearValue: [53 / 255, 68 / 255, 161 / 255, 1],
                loadOp: 'clear',
                storeOp: 'store',
            }],
            // @ts-ignore
            depthStencilAttachment: {
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            }
        };
    }

    override async setup() {
        this.shader = await ShaderFactory.createGraphicsShader("shaders/base.wgsl", ['scene', 'mesh', 'shadow']);

        this.colliderShader = await ShaderFactory.createGraphicsShader("shaders/collider.wgsl", ['scene', 'mesh'],{
            primitive: {
                topology: 'line-strip',
                cullMode: "none"
            },
            // depthStencil: {
            //     depthWriteEnabled: false,
            //     depthCompare: 'always',
            //     format: 'depth24plus',
            // }
        });
    }

    override onResize() {
        this.depthTexture.destroy();
        this.depthTexture = this.createDepthTexture();
    }

    render(commandEncoder: GPUCommandEncoder, sceneBindGroup: GPUBindGroup, shadowBindGroup: GPUBindGroup) {
        const { meshes, colliders} = engine.scene.getSceneComponents();

        this.renderPassDescriptor.colorAttachments[0].view = engine.ctx.getCurrentTexture().createView();
        this.renderPassDescriptor.depthStencilAttachment.view = this.depthTexture.createView();

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                // clearValue: [0.3, 0.3, 0.3, 1],
                clearValue: [53 / 255, 68 / 255, 161 / 255, 1],
                loadOp: 'clear',
                storeOp: 'store',
                view: engine.ctx.getCurrentTexture().createView()
            }],
            depthStencilAttachment: {
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
                view: this.depthTexture.createView()
            }
        };

        const pass = commandEncoder.beginRenderPass(renderPassDescriptor);

        // Render meshes
        pass.setPipeline(this.shader.pipeline);
        pass.setBindGroup(0, sceneBindGroup);
        pass.setBindGroup(2, shadowBindGroup);

        for (const mesh of meshes) {
            pass.setBindGroup(1, mesh.shaderData.bindGroup)
            pass.setVertexBuffer(0, mesh.vertexBuffer);

            pass.draw(mesh.vertexCount);
        }

        // Render colliders
        pass.setPipeline(this.colliderShader.pipeline);
        pass.setBindGroup(0, sceneBindGroup);

        for (const collider of colliders) {
            for (const [, { mesh }] of collider.meshes.entries()) {
                pass.setBindGroup(1, mesh.shaderData.bindGroup)
                pass.setVertexBuffer(0, mesh.vertexBuffer);

                pass.draw(mesh.vertexCount);
            }
        }

        pass.end();
    }

    private createDepthTexture() {
        const canvasTexture = engine.ctx.getCurrentTexture();

        return engine.device.createTexture({
            size: [canvasTexture.width, canvasTexture.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
    }
}

export class MeshShaderData {
    readonly bindGroup: GPUBindGroup;
    private readonly mesh: Mesh;

    private readonly transformBuffer: GPUBuffer;
    private readonly normalTransformBuffer: GPUBuffer;
    private readonly materialBuffer: GPUBuffer;

    constructor(mesh: Mesh) {
        this.mesh = mesh;

        this.transformBuffer = engine.device.createBuffer({
            label: 'Transform',
            size: MAT4x4_BYTE_LENGTH,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.normalTransformBuffer = engine.device.createBuffer({
            label: 'Normal transform',
            size: MAT4x4_BYTE_LENGTH,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.materialBuffer = engine.device.createBuffer({
            label: 'Material',
            size: VEC4_BYTE_LENGTH * 3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.bindGroup = engine.device.createBindGroup({
            layout: engine.renderer.getBindGroupLayouts().mesh,
            entries: [
                { binding: 0, resource: { buffer: this.transformBuffer } },
                { binding: 1, resource: { buffer: this.normalTransformBuffer } },
                { binding: 2, resource: { buffer: this.materialBuffer } }
            ]
        });
    }

    write() {
        engine.device.queue.writeBuffer(this.transformBuffer, 0, this.mesh.transform.getMatrix());

        engine.device.queue.writeBuffer(this.normalTransformBuffer, 0, this.mesh.transform.getNormalMatrix());

        engine.device.queue.writeBuffer(this.materialBuffer, 0, this.mesh.material.Kd);
        engine.device.queue.writeBuffer(this.materialBuffer, VEC4_BYTE_LENGTH, this.mesh.material.Ks);
        engine.device.queue.writeBuffer(this.materialBuffer, VEC4_BYTE_LENGTH*2, this.mesh.material.Ka);
    }
}
