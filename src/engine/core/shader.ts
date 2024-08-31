import { engine } from ".";

export class ShaderFactory {
    static async createGraphicsShader(
        filepath: string,
        bindGroups: ('mesh' | 'scene' | 'shadow' | 'cascade')[],
        options?: Partial<GPURenderPipelineDescriptor>,
    ): Promise<GraphicsShader> {
        const instance = new GraphicsShader(filepath);

        const code = await engine.loader.loadTextFile(filepath);
        const bindGroupLayouts = engine.renderer.getBindGroupLayouts();
        const shaderBGL = bindGroups.map(group => bindGroupLayouts[group]);

        await instance.init(shaderBGL, code, options);

        return instance;
    }

    static async createComputeShader(filepath: string) {
        throw new Error("Not implemented");
    }
}

abstract class AbstractShader {
    static labelPrefix = "";

    device: GPUDevice;
    filepath: string;
    pipeline: GPURenderPipeline;

    protected label: string;
    protected module: GPUShaderModule;

    protected constructor(filepath: string) {
        this.device = engine.device;
        this.filepath = filepath;
    }

    async init(bindGroupLayouts: GPUBindGroupLayout[], code: string, options?: Partial<GPURenderPipelineDescriptor>) {
        this.label = `${AbstractShader.labelPrefix}: ${this.filepath}`;
        this.module = engine.device.createShaderModule({ label: this.label, code });
    }
}

export class GraphicsShader extends AbstractShader {
    static override labelPrefix = "Graphics shader"

    constructor(filepath: string) {
        super(filepath);
    }

    override async init(bindGroupLayouts: GPUBindGroupLayout[], code: string, options: Partial<GPURenderPipelineDescriptor>): Promise<void> {
        await super.init(bindGroupLayouts, code, options);

        const layout = this.device.createPipelineLayout({ bindGroupLayouts });

        this.pipeline = this.device.createRenderPipeline({
            label: this.label,
            layout,
            vertex: {
                module: this.module,
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
                module: this.module,
                targets: [{ format: engine.textureFormat }]
            },
            primitive: {
                topology: "triangle-list",
                cullMode: "back"
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            },
            ...options
        });
    }
}

export class ComputeShader extends AbstractShader {
    static override labelPrefix = "Compute shader"

    constructor(filepath: string) {
        super(filepath);
    }
}
