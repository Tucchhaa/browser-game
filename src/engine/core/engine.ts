import { EngineEventListener, Input, Loader, ShaderFactory, Renderer, Tree, Scene } from ".";
import { Texture } from "../resources";

export class Engine {
    device: GPUDevice;
    canvas: HTMLCanvasElement;
    ctx: GPUCanvasContext;
    textureFormat: GPUTextureFormat;

    scene: Scene;
    input: Input;
    tree: Tree;
    loader: Loader;
    shaderFactory: ShaderFactory;
    renderer: Renderer;

    async init(device: GPUDevice, canvas: HTMLCanvasElement) {
        // FOR DEBUGGING
        (window as any)._$ = this;

        this.device = device;
        this.canvas = canvas;

        this.initCanvas();

        this.scene = new Scene();
        this.input = new Input();
        this.tree = new Tree();
        this.loader = new Loader();
        this.renderer = new Renderer();
        this.shaderFactory = new ShaderFactory([
            this.renderer.sceneBindGroupLayout, this.renderer.meshBindGroupLayout
        ]);

        await EngineEventListener.setup();
        await Texture.setup();
    }

    private initCanvas() {
        const that = this;

        this.ctx = this.canvas.getContext("webgpu") as unknown as GPUCanvasContext;
        this.textureFormat = navigator.gpu.getPreferredCanvasFormat();

        this.ctx.configure({ device: this.device, format: this.textureFormat });

        new ResizeObserver(resizeCanvas).observe(this.canvas);

        function resizeCanvas() {
            that.canvas.width = window.innerWidth * 2;
            that.canvas.height = window.innerHeight * 2;

            that.renderer.onResize();
        }
    }

    start() {
        // this.renderer.render();
        this.renderLoop();
    }

    private renderLoop() {
        EngineEventListener.beforeRender();
        this.renderer.render();
        EngineEventListener.afterRender();

        requestAnimationFrame(this.renderLoop.bind(this));
    }

    async stop() {
        await EngineEventListener.teardown();
    }
}

export const engine = new Engine();