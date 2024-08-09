import { engine } from "./engine";

export class ShaderFactory {
    device: GPUDevice;
    bindGroupLayouts: GPUBindGroupLayout[];

    constructor(device: GPUDevice, bindGroupLayouts: GPUBindGroupLayout[]) {
        this.device = device;
        this.bindGroupLayouts = bindGroupLayouts;
    }

    async createGraphicsShader(filepath: string): Promise<GraphicsShader> {
        const instance = new GraphicsShader(filepath);
        const code = await engine.loader.loadTextFile(filepath);

        await instance.init(this.device, this.bindGroupLayouts, code);

        return instance;
    }

    async createComputeShader(filepath: string) {
        throw new Error("Not implemented");
    }
}

abstract class AbstractShader {
    static labelPrefix = "";

    filepath: string;
    pipeline: GPURenderPipeline;

    protected constructor(filepath: string) {
        this.filepath = filepath;
    }

    async init(device: GPUDevice, bindGroupLayouts: GPUBindGroupLayout[], code: string) {
        const label = `${AbstractShader.labelPrefix}: ${this.filepath}`;
        const module = device.createShaderModule({ label, code });

        // const sceneBindGroupLayout = device.createBindGroupLayout({
        //     entries: [
        //         { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {} }
        //     ]
        // });

        const layout = device.createPipelineLayout({ bindGroupLayouts });

        this.pipeline = device.createRenderPipeline({
            label,
            layout,
            vertex: {
                module,
                buffers: [
                    {
                        arrayStride: (3 + 2 + 3) * 4, // pos + uv + normal
                        attributes: [
                            { shaderLocation: 0, offset: 0, format: 'float32x3' },
                            { shaderLocation: 1, offset: 3 * 4, format: 'float32x2' },
                            { shaderLocation: 2, offset: 5 * 4, format: 'float32x3', }
                        ]
                    }
                ]
            },
            fragment: {
                module: module,
                targets: [{ format: engine.textureFormat }]
            },
            primitive: {
                topology: "triangle-list",
                cullMode: "none"
            },

        });
    }
}

export class GraphicsShader extends AbstractShader {
    static override labelPrefix = "Graphics shader"

    constructor(filepath: string) {
        super(filepath);
    }
}

export class ComputeShader extends AbstractShader {
    static override labelPrefix = "Compute shader"

    constructor(filepath: string) {
        super(filepath);
    }
}
