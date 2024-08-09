import { Entity } from "./entity";
import { Input } from "./input";
import { Loader } from "./loader";
import { ShaderFactory } from "./shader";
import { Renderer } from "./renderer";
import { Tree } from "./tree";
import { Texture } from "../resources/texture";
import { Material } from "../resources/material";

export class Engine {
    device: GPUDevice;
    canvas: HTMLCanvasElement;
    ctx: GPUCanvasContext;
    textureFormat: GPUTextureFormat;

    input: Input;
    tree: Tree;
    loader: Loader;
    shaderFactory: ShaderFactory;
    renderer: Renderer;

    constructor() { }

    async init(device: GPUDevice, canvas: HTMLCanvasElement) {
        // FOR DEBUGGING
        (window as any)._$ = this;

        this.device = device;
        this.canvas = canvas;

        this.input = new Input();
        this.tree = new Tree();
        this.loader = new Loader();
        this.renderer = new Renderer(device);
        this.shaderFactory = new ShaderFactory(device, [
            this.renderer.sceneBindGroupLayout, this.renderer.meshBindGroupLayout
        ]);

        this.initCanvas();

        await Entity.setup();
        await Texture.setup();
    }

    private initCanvas() {
        const that = this;

        this.ctx = this.canvas.getContext("webgpu") as unknown as GPUCanvasContext;
        this.textureFormat = navigator.gpu.getPreferredCanvasFormat();

        this.ctx.configure({ device: this.device, format: this.textureFormat });

        new ResizeObserver(resizeCanvas).observe(this.canvas);

        function resizeCanvas() {
            that.canvas.width = window.innerWidth;
            that.canvas.height = window.innerHeight;
        }
    }

    start() {
        // this.renderer.render();
        this.renderLoop();
    }

    private renderLoop() {
        Entity.beforeRender();
        this.renderer.render();
        Entity.afterRender();

        requestAnimationFrame(this.renderLoop.bind(this));
    }

    async stop() {
        await Entity.teardown();
    }
}

export const engine = new Engine();