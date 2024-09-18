import { engine, EngineEventListener, Tree } from ".";
import { Mesh, Camera, DirectLight, PointLight, Sync, Collider } from "../components";

interface SceneComponents {
    meshes: Mesh[],
    colliders: Collider[],
    directLights: DirectLight[],
    pointLights: PointLight[]
}

export class Scene extends EngineEventListener {
    mainCamera: Camera;

    tree: Tree;

    constructor() {
        super();

        this.tree = new Tree();
    }

    // TODO: use caching
    getSceneComponents(): SceneComponents {
        const meshes:       Mesh[]        = [];
        const colliders:    Collider[]    = [];
        const directLights: DirectLight[] = [];
        const pointLights:  PointLight[]  = [];

        this.tree.traverse(gameObject => {
            if(!gameObject.visible)
                return;

            const _meshes: Mesh[]              = gameObject.components.getAll(Mesh);
            const _colliders: Collider[]       = gameObject.components.getAll(Collider);
            const _directLights: DirectLight[] = gameObject.components.getAll(DirectLight);
            const _pointLights: PointLight[]   = gameObject.components.getAll(PointLight);

            if(meshes)         meshes      .push(..._meshes);
            if(colliders)      colliders   .push(..._colliders);
            if(directLights)   directLights.push(..._directLights);
            if(pointLights)    pointLights .push(..._pointLights);
        });

        return { meshes, colliders, directLights, pointLights };
    }
}