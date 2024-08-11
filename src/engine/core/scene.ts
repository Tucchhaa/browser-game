import { engine, EngineEventListener } from ".";
import { Mesh, Camera, DirectLight, PointLight } from "../components";

interface SceneComponents {
    meshes: Mesh[],
    directLights: DirectLight[],
    pointLights: PointLight[]
}

export class Scene extends EngineEventListener {
    mainCamera: Camera;

    getSceneComponents(): SceneComponents {
        const meshes = [];
        const directLights = [];
        const pointLights = [];

        engine.tree.applyToAll(gameObject => {
            const _meshes           = gameObject.components.getAll(Mesh);
            const _directLights = gameObject.components.getAll(DirectLight);
            const _pointLights   = gameObject.components.getAll(PointLight);

            if(meshes)       meshes.push(..._meshes);
            if(directLights) directLights.push(..._directLights);
            if(pointLights)  pointLights.push(..._pointLights);
        });

        return { meshes, directLights, pointLights };
    }
}