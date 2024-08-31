import { Shape } from "../core/network.types";
import { engine, MeshShaderData } from "../core";
import { Component, Mesh, Transform } from ".";

type MeshesDict = Map<number, { mesh: Mesh, transform: Transform }>;

export class Collider extends Component {
    readonly meshes: MeshesDict;

    constructor(meshes: MeshesDict) {
        super();

        this.meshes = meshes;
    }

    static async create(shapes: Shape[]) {
        const meshes: MeshesDict = new Map();

        for(const shape of shapes) {
            const mesh = await engine.loader.loadShapeMesh(shape.type);
            const transform = new Transform();

            mesh.shaderData.write = function () {
                const that = this as MeshShaderData;
                // @ts-ignore
                engine.device.queue.writeBuffer(that.transformBuffer, 0, transform.getMatrix());
            }

            meshes.set(shape.shapeID, { mesh, transform });
        }

        return new Collider(meshes);
    }
}