import { EngineEventListener, engine } from "..";
import { MAT4x4_BYTE_LENGTH, VEC4_BYTE_LENGTH } from "../../const";
import { DirectLight, PointLight } from "../../components";
import { MeshRenderer, ShadowMapRenderer } from ".";

export class Renderer extends EngineEventListener {
    private readonly shadowRenderer: ShadowMapRenderer;
    private readonly meshRenderer: MeshRenderer;

    private readonly sceneDataLayout: GPUBindGroupLayout;
    private readonly sceneShaderData: SceneShaderData;

    constructor() {
        super();

        this.shadowRenderer = new ShadowMapRenderer();
        this.meshRenderer = new MeshRenderer();

        this.sceneDataLayout = engine.device.createBindGroupLayout({
            label: 'Scene bind group layout',
            entries: [
                // camera
                { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
                // directLights
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
                // pointLights
                { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },

                // cascaded shadow maps
                { binding: 3, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'depth', viewDimension: '2d-array' } },
                // shadow map sampler
                { binding: 4, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'comparison' } },
            ]
        });
        this.sceneShaderData = new SceneShaderData(this.sceneDataLayout, this.shadowRenderer);
    }

    getBindGroupLayouts() {
        return {
            scene:   this.sceneDataLayout,
            mesh:    this.meshRenderer.meshDataLayout,
            shadow:  this.shadowRenderer.shadowDataLayout,
            cascade: this.shadowRenderer.cascadeDataLayout
        };
    }

    render() {
        this.updateShaderData();

        const commandEncoder = engine.device.createCommandEncoder();

        this.shadowRenderer.render(commandEncoder);
        this.meshRenderer.render(commandEncoder, this.sceneShaderData.bindGroup, this.shadowRenderer.shadowShaderData.bindGroup);

        engine.device.queue.submit([commandEncoder.finish()]);
    }

    private updateShaderData() {
        const { meshes, colliders, directLights } = engine.scene.getSceneComponents();

        this.sceneShaderData.write();

        this.shadowRenderer.shadowShaderData.write(directLights[0]);

        for(const mesh of meshes) {
            mesh.shaderData.write();
        }

        for(const collider of colliders) {
            for (const [, { mesh }] of collider.meshes.entries()) {
                mesh.shaderData.write();
            }
        }
    }
}

class SceneShaderData {
    readonly bindGroup: GPUBindGroup;

    private readonly cameraBuffer: GPUBuffer;
    private readonly directLightsBuffer: GPUBuffer;
    private readonly pointLightsBuffer: GPUBuffer;

    private readonly DIRECT_LIGHTS_MAX_NUM = 10;
    private readonly POINT_LIGHTS_MAX_NUM = 100;

    private readonly DIRECT_LIGHT_SIZE = (3 + 1 + 3 + 1) * 4;
    private readonly POINT_LIGHT_SIZE = (3 + 1 + 3 + 1) * 4;

    constructor(layout: GPUBindGroupLayout, shadowMapRenderer: ShadowMapRenderer) {
        this.cameraBuffer = engine.device.createBuffer({
            label: 'Camera',
            size: MAT4x4_BYTE_LENGTH * 2 + VEC4_BYTE_LENGTH,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.directLightsBuffer = engine.device.createBuffer({
            label: 'Direct lights',
            size: this.DIRECT_LIGHTS_MAX_NUM * this.DIRECT_LIGHT_SIZE,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })

        this.pointLightsBuffer = engine.device.createBuffer({
            label: 'Point lights',
            size: this.POINT_LIGHTS_MAX_NUM * this.POINT_LIGHT_SIZE,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })

        this.bindGroup = engine.device.createBindGroup({
            label: 'Scene shader data',
            layout,
            entries: [
                { binding: 0, resource: { buffer: this.cameraBuffer } },
                { binding: 1, resource: { buffer: this.directLightsBuffer } },
                { binding: 2, resource: { buffer: this.pointLightsBuffer } },

                { binding: 3, resource: shadowMapRenderer.depthTextureView },
                { binding: 4, resource: engine.device.createSampler({
                        compare: 'less',
                        addressModeU: 'clamp-to-edge',
                        addressModeV: 'clamp-to-edge',
                }) },
            ]
        });
    }

    write() {
        const { directLights, pointLights} = engine.scene.getSceneComponents();

        // TODO: add caching, no need to write lights every time
        this.writeCamera();
        this.writeDirectLights(directLights);
        this.writePointLights(pointLights);
    }

    private writeCamera() {
        const camera = engine.scene.mainCamera;

        engine.device.queue.writeBuffer(this.cameraBuffer, 0, camera.getViewMatrix());
        engine.device.queue.writeBuffer(this.cameraBuffer, MAT4x4_BYTE_LENGTH, camera.getProjectionMatrix());
        engine.device.queue.writeBuffer(this.cameraBuffer, MAT4x4_BYTE_LENGTH * 2, camera.transform.position);
    }

    private writeDirectLights(lights: DirectLight[]) {
        const data = new Float32Array(lights.length * this.DIRECT_LIGHT_SIZE);

        for(let i=0; i < lights.length; i++) {
            const light = lights[i];
            const offset = i * this.DIRECT_LIGHT_SIZE;
            const direction = light.transform.getDirection();

            data.set([...light.color, light.intensity, ...direction], offset);
        }

        engine.device.queue.writeBuffer(this.directLightsBuffer, 0, data);
    }

    private writePointLights(lights: PointLight[]) {

    }
}
