import { engine } from "../core/engine";

export class Texture {
    static defaultTexture: Texture;

    static async setup() {
        Texture.defaultTexture = await engine.loader.loadTexture("assets/textures/default.png");
    }

    filepath: string;
    width: number;
    height: number;
    format: GPUTextureFormat;
    texture: GPUTexture;

    constructor(filepath: string, width: number, height: number, format: GPUTextureFormat, bitmap: ImageBitmap) {
        this.filepath = filepath;
        this.width = width;
        this.height = height;
        this.format = format;

        this.texture = this.createTexture(bitmap);
    }

    private createTexture(bitmap: ImageBitmap): GPUTexture {
        const texture = engine.device.createTexture({
            label: this.filepath,
            format: this.format,
            size: [this.width, this.height],
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });

        engine.device.queue.copyExternalImageToTexture(
            { source: bitmap },
            { texture },
            [this.width, this.height]
        );

        return texture;
    }
}