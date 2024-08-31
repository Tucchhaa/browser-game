import { EngineEventListener, Input, Loader, ShaderFactory, Renderer, Tree, Scene, Network } from ".";
import { Texture } from "../resources";

export class Engine {
    device: GPUDevice;
    limits: GPUSupportedLimits;
    canvas: HTMLCanvasElement;
    ctx: GPUCanvasContext;
    textureFormat: GPUTextureFormat;

    network: Network;
    scene: Scene;
    input: Input;
    tree: Tree;
    loader: Loader;
    renderer: Renderer;

    async init(device: GPUDevice, canvas: HTMLCanvasElement) {
        // FOR DEBUGGING
        (window as any)._$ = this;

        this.device = device;
        this.limits = this.device.limits;
        this.canvas = canvas;

        this.initCanvas();

        this.network = new Network("ws://localhost:8081/ws");
        await this.network.open();

        this.input         = new Input();
        this.tree          = new Tree();
        this.loader        = new Loader();
        this.renderer      = new Renderer();

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

            EngineEventListener.onResize();
        }
    }

    start() {
        // this.renderer.render();

        EngineEventListener.onStart();

        if(this.scene === undefined) {
            throw new Error("Scene is not defined");
        }

        this.network.start();
        this.renderLoop();
    }

    private renderLoop() {
        EngineEventListener.beforeRender();

        this.tree.updateTransforms();
        this.renderer.render();
        EngineEventListener.afterRender();

        requestAnimationFrame(this.renderLoop.bind(this));
    }

    async stop() {
        await EngineEventListener.teardown();
    }
}

export const engine = new Engine();