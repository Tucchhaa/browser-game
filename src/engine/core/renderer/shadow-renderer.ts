import { EngineEventListener, engine, GraphicsShader, ShaderFactory } from "..";
import { FLOAT_BYTE_LENGTH, MAT4x4_BYTE_LENGTH, MAT4x4_LENGTH } from "../../const";
import { DirectLight } from "../../components";
import { Mat4, mat4, vec3, vec4, Vec4 } from "wgpu-matrix";

export class ShadowMapRenderer extends EngineEventListener {
    private readonly device: GPUDevice;
    private readonly texture: GPUTexture;

    readonly shadowDataLayout: GPUBindGroupLayout;
    readonly cascadeDataLayout: GPUBindGroupLayout;

    readonly depthTextureView: GPUTextureView;
    readonly shadowShaderData: ShadowShaderData;

    private readonly passDescriptors: GPURenderPassDescriptor[] = [];
    private shader: GraphicsShader;

    private readonly cascadeLevels = [0, 0.03, 0.1, 0.3];
    private readonly cascadeCount = this.cascadeLevels.length - 1;
    private readonly resolution = 1024;

    // TODO: remove when transfer to compute shaders
    private readonly cascadeBindGroups: GPUBindGroup[] = [];

    constructor() {
        super();

        this.device = engine.device;

        this.texture = this.device.createTexture({
            label: 'Shadow cascaded map',
            size: [this.resolution, this.resolution, this.cascadeCount],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });

        this.shadowDataLayout = this.device.createBindGroupLayout({
            label: 'Shadow map shader data',
            entries: [
                // lightPerspectives
                { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
                // cascadeLevels
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } }
            ]
        });

        this.cascadeDataLayout = this.device.createBindGroupLayout({
            label: 'Cascade shader data',
            entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }
            ]
        });

        this.depthTextureView = this.texture.createView({
            dimension: '2d-array'
        });

        this.shadowShaderData = new ShadowShaderData(this.shadowDataLayout, this.cascadeLevels);

        for(let i= 0; i < this.cascadeCount; i++) {
            this.passDescriptors.push({
                colorAttachments: [],
                depthStencilAttachment: {
                    view: this.texture.createView({
                        dimension: '2d',
                        baseArrayLayer: i,
                        arrayLayerCount: 1
                    }),
                    depthClearValue: 1.0,
                    depthLoadOp: 'clear',
                    depthStoreOp: 'store',
                },
            });

            const cascadeIndexBuffer = engine.device.createBuffer({
                label: 'Cascade index',
                size: 4,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });

            engine.device.queue.writeBuffer(cascadeIndexBuffer, 0, new Uint32Array([i]));

            this.cascadeBindGroups.push(this.device.createBindGroup({
                label: 'Cascade shader data',
                layout: this.cascadeDataLayout,
                entries: [
                    { binding: 0, resource: { buffer: cascadeIndexBuffer } }
                ]
            }));
        }
    }

    override async setup() {
        this.shader = await ShaderFactory.createGraphicsShader(
            'shaders/shadow.wgsl', ['shadow', 'mesh', 'cascade'], { fragment: undefined }
        );
    }

    render(commandEncoder: GPUCommandEncoder) {
        const { meshes } = engine.scene.getSceneComponents();

        for(let i = 0; i < this.cascadeCount; i++) {
            const passDescriptor = this.passDescriptors[i];
            const pass = commandEncoder.beginRenderPass(passDescriptor);

            pass.setPipeline(this.shader.pipeline);
            pass.setBindGroup(0, this.shadowShaderData.bindGroup);
            pass.setBindGroup(2, this.cascadeBindGroups[i]);

            for(const mesh of meshes) {
                pass.setBindGroup(1, mesh.shaderData.bindGroup);
                pass.setVertexBuffer(0, mesh.vertexBuffer);

                pass.draw(mesh.vertexCount);
            }

            pass.end();
        }
    }
}

class ShadowShaderData extends EngineEventListener {
    private readonly cascadeCount: number;
    private readonly cascadeLevels: number[];
    private cascadePlanes: number[];

    readonly bindGroup: GPUBindGroup;
    private readonly lightPerspectivesBuffer: GPUBuffer;
    private readonly cascadePlanesBuffer: GPUBuffer;

    constructor(layout: GPUBindGroupLayout, cascadeLevels: number[]) {
        super();

        this.cascadeCount = cascadeLevels.length - 1;
        this.cascadeLevels = cascadeLevels;

        this.lightPerspectivesBuffer = engine.device.createBuffer({
            label: 'Light perspectives label',
            size: MAT4x4_BYTE_LENGTH * this.cascadeCount,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        this.cascadePlanesBuffer = engine.device.createBuffer({
            label: 'Cascade planes',
            size: FLOAT_BYTE_LENGTH * this.cascadeCount,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        this.bindGroup = engine.device.createBindGroup({
            label: 'Shadow shader data',
            layout,
            entries: [
                { binding: 0, resource: { buffer: this.lightPerspectivesBuffer } },
                { binding: 1, resource: { buffer: this.cascadePlanesBuffer } }
            ]
        });

    }

    override onStart() {
        this.cascadePlanes = this.calculateCascadePlanes(this.cascadeLevels);

        engine.device.queue.writeBuffer(this.cascadePlanesBuffer, 0, new Float32Array(this.cascadePlanes));
    }

    write(light: DirectLight) {
        const perspectives = this.calculateCascadePerspectives(light);
        const data = new Float32Array(MAT4x4_LENGTH * this.cascadeCount);

        for(let i= 0; i < this.cascadeCount; i++) {
            data.set(perspectives[i], i * MAT4x4_LENGTH);
        }

        engine.device.queue.writeBuffer(this.lightPerspectivesBuffer, 0, data);
    }

    private calculateCascadePerspectives(light: DirectLight) {
        const result: Mat4[] = [];

        const camera = engine.scene.mainCamera;

        for(let i= 0; i < this.cascadeCount; i++) {
            const cascadeNear = i === 0 ? camera.near : this.cascadePlanes[i-1];
            const cascadeFar = this.cascadePlanes[i];

            const projection = mat4.perspective(camera.fov, camera.getAspect(), cascadeNear, cascadeFar);
            const viewProjection = mat4.mul(projection, camera.getViewMatrix());

            const perspectiveInverse = mat4.inverse(viewProjection);

            const frustumCorners: Vec4[] = [];
            let center: Vec4 = vec4.create(0, 0, 0, 1);

            for(let x= -1; x <= 1; x += 2) {
                for(let y= -1; y <= 1; y += 2) {
                    for(let z = -1; z <= 1; z += 2) {
                        let point: Vec4 = vec4.transformMat4(vec4.create(x, y, z, 1), perspectiveInverse);
                        point = vec4.divScalar(point, point[3]);

                        frustumCorners.push(point);
                        center = vec4.add(center, point);
                    }
                }
            }

            center = vec4.divScalar(center, frustumCorners.length);
            center = vec3.create(center[0], center[1], center[2]);

            const lightView = mat4.lookAt(center, vec3.add(center, light.transform.getDirection()), vec3.create(0, 1, 0));

            let minX = Number.MAX_VALUE;
            let maxX = Number.MIN_VALUE;
            let minY = Number.MAX_VALUE;
            let maxY = Number.MIN_VALUE;
            let minZ = Number.MAX_VALUE;
            let maxZ = Number.MIN_VALUE;
            for(const v of frustumCorners) {
                const transformed = vec4.transformMat4(v, lightView);
                minX = Math.min(minX, transformed[0]);
                maxX = Math.max(maxX, transformed[0]);
                minY = Math.min(minY, transformed[1]);
                maxY = Math.max(maxY, transformed[1]);
                minZ = Math.min(minZ, transformed[2]);
                maxZ = Math.max(maxZ, transformed[2]);
            }

            // Need that to cast shadows of objects behind the camera. Adjust if needed
            const zMult = 10.0;
            minZ = minZ < 0 ? minZ * zMult : minZ / zMult;
            maxZ = maxZ < 0 ? maxZ / zMult : maxZ * zMult;

            const lightProjection = mat4.ortho(minX, maxX, minY, maxY, minZ, maxZ);
            const cascadePerspective = mat4.mul(lightProjection, lightView);

            result.push(cascadePerspective);
        }

        return result;
    }

    private calculateCascadePlanes(cascadeLevels: number[]) {
        const result = [];

        const camera = engine.scene.mainCamera;

        for(let i= 0; i < this.cascadeCount; i++) {
            const cascadeFar = camera.near + (camera.far - camera.near) * cascadeLevels[i+1];

            result.push(cascadeFar);
        }

        return result;
    }
}
