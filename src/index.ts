import { quat, vec3 } from "wgpu-matrix";

import { engine } from "./engine/core";
import { Camera, DirectLight, CharacterController } from "./engine/components";

window.addEventListener('load', main);

const canvas = document.getElementById("main_canvas") as HTMLCanvasElement;

async function main() {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter?.requestDevice();

    if (device === undefined) {
        throw new Error("WebGPU is not supported on this device");
    }

    await engine.init(device, canvas);

    engine.scene = await engine.loader.loadScene("scene1");

    // create camera
    const cameraObject = engine.tree.spawnGameObject();
    cameraObject.transform.position = vec3.fromValues(0, 2, 5);

    const controller = new CharacterController();

    const camera = new Camera();
    cameraObject.components.add(camera);
    cameraObject.components.add(controller);

    engine.scene.mainCamera = camera;

    // create car
    // const car = await engine.loader.loadMesh("assets/car/car.obj", "assets/car/car.mtl");
    // car.transform.translate(vec3.create(0, 0.24, 0));
    // car.transform.rotate(quat.fromEuler(0, Math.PI, 0, 'yxz'));
    // engine.tree.addGameObject(car);
    //
    // // create ground
    // const ground = await engine.loader.loadMesh("assets/plane.obj", "assets/plane.mtl");
    // ground.transform.scaleBy(vec3.create(10, 1, 10));
    // engine.tree.addGameObject(ground);

    // create direct light
    const directLightObject = engine.tree.spawnGameObject();
    const directLight = new DirectLight();
    directLightObject.transform.rotate(quat.fromEuler(-Math.PI/4, -Math.PI/4, 0, 'yxz'));
    directLightObject.components.add(directLight);


    engine.start();
}
