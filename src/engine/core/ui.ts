import { EngineEventListener } from "./engine-event-listener";
import { engine } from "./engine";

export class UI extends EngineEventListener {
    private readonly root: HTMLElement;
    
    private canvas: HTMLCanvasElement;
    private statsDisplay: HTMLElement;

    private statsDisplayInterval: number;

    constructor(root: HTMLElement) {
        super();

        this.root = root;
    }

    createCanvas(): HTMLCanvasElement {
        if(this.root.childNodes.length !== 0) {
            throw new Error("Root element must be empty");
        }

        if(this.root.tagName === 'CANVAS') {
            throw new Error("Root element cannot be a canvas");
        }

        this.canvas = document.createElement("canvas");
        this.statsDisplay = document.createElement("pre");

        this.root.appendChild(this.canvas);
        this.root.appendChild(this.statsDisplay);

        this.root.style.width = '100%';
        this.root.style.height = '100%';

        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';

        this.statsDisplay.style.position = 'absolute';
        this.statsDisplay.style.top = '10px';
        this.statsDisplay.style.left = '10px';
        this.statsDisplay.style.margin = '0';
        this.statsDisplay.style.padding = '3px 5px';
        this.statsDisplay.style.color = 'white';
        this.statsDisplay.style.background = 'black';

        this.watchResize();

        return this.canvas;
    }

    override onStart() {
        this.statsDisplayInterval = setInterval(() => {
            const stats = engine.frameStats;
            this.statsDisplay.innerText =
                `js time: ${stats.jsTimeAvg.toFixed(3)}\n` +
                `gpu time: ${stats.gpuTimeAvg.toFixed(3)}\n` +
                `triangles: ${stats.triangles}\n` +
                `fps: ${(1000/stats.dtAvg).toFixed(1)}`;
        }, 100);
    }

    private watchResize() {
        const that = this;

        new ResizeObserver(resizeCanvas).observe(this.root);

        function resizeCanvas() {
            that.canvas.width = window.innerWidth * 2;
            that.canvas.height = window.innerHeight * 2;

            EngineEventListener.onResize();
        }
    }
}