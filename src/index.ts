import { engine } from "./engine/core/engine";
import { CharacterController } from "./engine/components/character-controller";
import { CameraComponent } from "./engine/components/camera";

window.addEventListener('load', main);

const canvas = document.getElementById("main_canvas") as HTMLCanvasElement;

async function main() {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter?.requestDevice();

    if (device === undefined) {
        throw new Error("WebGPU is not supported on this device");
    }

    await engine.init(device, canvas);

    // create camera
    const cameraObject = engine.tree.spawnGameObject();
    const controller = new CharacterController();

    const camera = new CameraComponent();
    cameraObject.components.add(camera);
    cameraObject.components.add(controller);

    engine.scene.mainCamera = camera;

    // create car
    const car = await engine.loader.loadMesh("assets/car/car.obj", "assets/car/car.mtl");

    engine.tree.addGameObject(car);

    engine.start();
}
