import { EngineEventListener, Input, Loader, Renderer, Tree, Scene, Network, UI } from ".";
import { Texture } from "../resources";

type FrameStats = {
    timestamp: number;
    dtAvg: number;
    triangles: number;
    jsTimeAvg: number;
    gpuTimeAvg: number;
};

export class Engine {
    device: GPUDevice;
    limits: GPUSupportedLimits;
    canvas: HTMLCanvasElement;
    ctx: GPUCanvasContext;
    textureFormat: GPUTextureFormat;

    ui: UI;
    network: Network;
    scene: Scene;
    input: Input;
    tree: Tree;
    loader: Loader;
    renderer: Renderer;

    frameStats: FrameStats = { timestamp: 0, dtAvg: 0, triangles: 0, jsTimeAvg: 0, gpuTimeAvg: 0 };

    async init(device: GPUDevice, root: HTMLElement) {
        // FOR DEBUGGING
        (window as any)._$ = this;

        this.device = device;
        this.limits = this.device.limits;

        this.ui = new UI(root);
        this.canvas = this.ui.createCanvas();

        this.initCanvas();

        this.network = new Network("ws://localhost:8081/ws");
        await this.network.open();

        this.input    = new Input();
        this.tree     = new Tree();
        this.loader   = new Loader();
        this.renderer = new Renderer();

        await EngineEventListener.setup();
        await Texture.setup();
    }

    private initCanvas() {
        this.ctx = this.canvas.getContext("webgpu") as unknown as GPUCanvasContext;
        this.textureFormat = navigator.gpu.getPreferredCanvasFormat();

        this.ctx.configure({ device: this.device, format: this.textureFormat });
    }

    start() {
        // this.renderer.render();

        EngineEventListener.onStart();

        if(this.scene === undefined) {
            throw new Error("Scene is not defined");
        }

        this.network.start();
        this.renderLoop(0);
    }

    async stop() {
        await EngineEventListener.teardown();
    }

    private renderLoop(timestamp: number) {
        const render = () => {
            EngineEventListener.beforeRender();

            this.tree.updateTransforms();
            this.renderer.render();

            EngineEventListener.afterRender();
        }

        this.updateStats(timestamp, render);

        requestAnimationFrame(this.renderLoop.bind(this));
    }

    private updateStats(timestamp: number, callback: () => void) {
        const startTime = performance.now();
        const dt = timestamp - this.frameStats.timestamp;

        // @ts-ignore
        this.frameStats = {
            timestamp,
            dtAvg:      0.8 * this.frameStats.dtAvg      + 0.2 * dt,
            gpuTimeAvg: 0.8 * this.frameStats.gpuTimeAvg + 0.2 * dt,
            jsTimeAvg:  this.frameStats.jsTimeAvg,
            triangles: 0,
        };

        callback();

        this.frameStats.jsTimeAvg = 0.8 * this.frameStats.jsTimeAvg + 0.2 * (performance.now() - startTime);
    }
}

export const engine = new Engine();