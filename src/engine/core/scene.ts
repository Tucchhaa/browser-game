import { EngineEventListener } from "./engineEventListener";
import { CameraComponent } from "../components/camera";
import { MeshComponent } from "../components/mesh";
import { DirectLightComponent } from "../components/lights/direct-light";
import { PointLightComponent } from "../components/lights/point-light-component";
import { engine } from "./engine";

interface SceneComponents {
    meshes: MeshComponent[],
    directLights: DirectLightComponent[],
    pointLights: PointLightComponent[]
}

export class Scene extends EngineEventListener {
    mainCamera: CameraComponent;

    getSceneComponents(): SceneComponents {
        const meshes = [];
        const directLights = [];
        const pointLights = [];

        engine.tree.applyToAll(gameObject => {
            const _meshes           = gameObject.components.getAll(MeshComponent);
            const _directLights = gameObject.components.getAll(DirectLightComponent);
            const _pointLights   = gameObject.components.getAll(PointLightComponent);

            if(meshes)       meshes.push(..._meshes);
            if(directLights) directLights.push(..._directLights);
            if(pointLights)  pointLights.push(..._pointLights);
        });

        return { meshes, directLights, pointLights };
    }
}