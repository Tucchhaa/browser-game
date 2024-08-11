import { engine } from "./engine/core/engine";

window.addEventListener('load', main);

const canvas = document.getElementById("main_canvas") as HTMLCanvasElement;

async function main() {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter?.requestDevice();

    if (device === undefined) {
        throw new Error("WebGPU is not supported on this device");
    }

    await engine.init(device, canvas);

    const car = await engine.loader.loadMesh("assets/car/car.obj", "assets/car/car.mtl");
    // const car = await engine.loader.loadMesh("untitled.obj");

    engine.tree.addGameObject(car);

    engine.start();
}
