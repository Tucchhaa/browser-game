import { Entity } from "./entity";
import { Input } from "./input";
import { Loader } from "./loader";
import { ShaderFactory } from "./shader";
import {Renderer} from "./renderer";

export class Engine {
    device: GPUDevice;
    canvas: HTMLCanvasElement;
    ctx: GPUCanvasContext;
    textureFormat: GPUTextureFormat;

    loader: Loader;
    input: Input;
    shaderFactory: ShaderFactory;
    renderer: Renderer;

    constructor() { }

    init(device: GPUDevice, canvas: HTMLCanvasElement) {
        this.device = device;
        this.canvas = canvas;

        this.input = new Input();
        this.loader = new Loader();
        this.shaderFactory = new ShaderFactory(device);
        this.renderer = new Renderer(device);

        this.initCanvas();
    }

    private initCanvas() {
        const that = this;

        this.ctx = this.canvas.getContext("webgpu") as unknown as GPUCanvasContext;
        this.textureFormat = navigator.gpu.getPreferredCanvasFormat();

        this.ctx.configure({ device: this.device, format: this.textureFormat });

        new ResizeObserver(resizeCanvas).observe(this.canvas);

        function resizeCanvas() {
            that.canvas.width = window.screen.width;
            that.canvas.height = window.screen.height;
        }
    }

    async start() {
        await Entity.setup();

        this.renderer.render();
        // this.renderLoop();
    }

    private renderLoop() {
        this.renderer.render();
        requestAnimationFrame(this.renderLoop.bind(this));
    }

    async stop() {
        await Entity.teardown();
    }
}

export const engine = new Engine();