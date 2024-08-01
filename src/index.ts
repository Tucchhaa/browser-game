import { engine } from "./engine";

window.addEventListener('load', main);

const canvas = document.getElementById("main_canvas") as HTMLCanvasElement;

async function main() {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter?.requestDevice();

    if (device === undefined) {
        throw new Error("WebGPU is not supported on this device");
    }

    engine.init(device, canvas);

    await engine.start();
}
