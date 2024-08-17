import { engine, EngineEventListener } from ".";
import { Mesh, Camera, DirectLight, PointLight, Sync } from "../components";

interface SceneComponents {
    meshes: Mesh[],
    directLights: DirectLight[],
    pointLights: PointLight[]
}

export class Scene extends EngineEventListener {
    mainCamera: Camera;

    // TODO: use caching
    getSceneComponents(): SceneComponents {
        const meshes = [];
        const directLights = [];
        const pointLights = [];

        engine.tree.traverse(gameObject => {
            const _meshes           = gameObject.components.getAll(Mesh);
            const _directLights = gameObject.components.getAll(DirectLight);
            const _pointLights   = gameObject.components.getAll(PointLight);

            if(meshes)       meshes.push(..._meshes);
            if(directLights) directLights.push(..._directLights);
            if(pointLights)  pointLights.push(..._pointLights);
        });

        return { meshes, directLights, pointLights };
    }

    getSyncComponents() {
        const networkComponents: Sync[] = [];

        engine.tree.traverse(gameObject => {
            const _networkComponents = gameObject.components.getAll(Sync);

            if(_networkComponents) networkComponents.push(..._networkComponents);
        });

        return networkComponents;
    }
}