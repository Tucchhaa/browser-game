export class ShaderFactory {
    device: GPUDevice;

    constructor(device: GPUDevice) {
        this.device = device;
    }

    async createGraphicsShader(filepath: string): Promise<GraphicsShader> {
        const instance = new GraphicsShader(filepath);

        await instance.init(this.device, await this.loadFile(filepath));

        return instance;
    }

    async createComputeShader(filepath: string) {
        throw new Error("Not implemented");
    }

    async loadFile(filepath: string) {
        const response = await fetch(filepath);

        if (response.ok)
            return await response.text();

        throw new Error(`Failed to load file: ${filepath}`);
    }

}

abstract class AbstractShader {
    static labelPrefix = "";

    filepath: string;
    module!: GPUShaderModule;

    protected constructor(filepath: string) {
        this.filepath = filepath;
    }

    async init(device: GPUDevice, code: string) {
        const label = `${AbstractShader.labelPrefix}: ${this.filepath}`;

        this.module = device.createShaderModule({ label, code });
    }
}

class GraphicsShader extends AbstractShader {
    static override labelPrefix = "Graphics shader"

    constructor(filepath: string) {
        super(filepath);
    }
}

class ComputeShader extends AbstractShader {
    static override labelPrefix = "Compute shader"

    constructor(filepath: string) {
        super(filepath);
    }
}