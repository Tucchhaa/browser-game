import { engine } from "./engine";

export class ShaderFactory {
    device: GPUDevice;

    constructor(device: GPUDevice) {
        this.device = device;
    }

    async createGraphicsShader(filepath: string): Promise<GraphicsShader> {
        const instance = new GraphicsShader(filepath);
        const code = await engine.loader.loadFile(filepath);

        await instance.init(this.device, code);

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

    async init(device: GPUDevice, code: string) {
        const label = `${AbstractShader.labelPrefix}: ${this.filepath}`;
        const module = device.createShaderModule({ label, code });

        const sceneBindGroupLayout = device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: {} }
            ]
        });

        const layout = device.createPipelineLayout({
            bindGroupLayouts: [
                sceneBindGroupLayout
            ]
        });

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
                            { shaderLocation: 2, offset: (3 + 2) * 4, format: 'float32x3', }
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
