import { quat, vec3 } from "wgpu-matrix";

import { engine } from "./engine/core";
import { Camera, CharacterController, DirectLight } from "./engine/components";

window.addEventListener('load', main);

const root = document.getElementById("game");

async function main() {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter?.requestDevice();

    if (device === undefined) {
        throw new Error("WebGPU is not supported on this device");
    }

    await engine.init(device, root);

    await engine.loader.loadScene("scene1");

    // create camera
    const cameraObject = engine.scene.tree.spawnGameObject();
    cameraObject.transform.position = vec3.fromValues(0, 2, 5);

    // const controller = new FreeCameraController();
    const controller = new CharacterController();

    const camera = new Camera();
    cameraObject.components.add(camera);
    cameraObject.components.add(controller);

    engine.scene.mainCamera = camera;

    // create direct light
    const directLightObject = engine.scene.tree.spawnGameObject();
    const directLight = new DirectLight();
    directLightObject.transform.rotate(quat.fromEuler(-Math.PI/4, -Math.PI/4, 0, 'yxz'));
    directLightObject.components.add(directLight);

    const playerData = await engine.network.requestPlayerData();
    const playerObject = engine.scene.tree.getGameObjectByID(playerData.gameObjectID);

    controller.setCharacterObject(playerObject);

    engine.start();
}
