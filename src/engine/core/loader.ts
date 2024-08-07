import OBJFile from 'obj-file-parser';
import { GameObject } from "./game-object";
import { engine } from "./engine";
import { vec3, Vec3 } from "wgpu-matrix";
import { MeshComponent } from "../components/mesh";

export class Loader {
    constructor() { }

    async loadMesh(filepath: string) {
        const extension = filepath.split('.').pop();

        switch (extension) {
            case 'obj':
                return await this.loadOBJ(filepath);
            default:
                throw new Error(`Extension \'${extension}\' is not supported`);
        }
    }

    async loadFile(filepath: string) {
        const response = await fetch(filepath);

        if (!response.ok)
            throw new Error(`Failed to load file: ${filepath}`);

        return await response.text();
    }

    private async loadOBJ(filepath: string) {
        const raw = await this.loadFile(filepath);

        return new OBJParser().parse(raw);
    }
}

class OBJParser {
    vertexOffset = 0;
    textureOffset = 0;

    constructor() { }

    parse(raw: string): GameObject {
        const parser = new OBJFile(raw);
        const obj = parser.parse();

        const gameObject = engine.tree.createGameObject();

        for(const model of obj.models) {
            const childGameObject = this.parseModel(model);

            engine.tree.addChildTo(gameObject, childGameObject);

            this.vertexOffset += model.vertices.length;
            this.textureOffset += model.textureCoords.length;
        }

        return gameObject;
    }

    parseModel(model: OBJFile.ObjModel): GameObject {
        const vertexData = [];
        const gameObject = engine.tree.createGameObject();

        for(const face of model.faces) {
            for(let j=1; j < face.vertices.length - 1; j++) {
                const triangle: { pos: Vec3, u: number, v: number}[] = [];

                [0, j, j + 1].map(vertexInd => {
                    const vertex = face.vertices[vertexInd]!;

                    const vertexIndex = vertex.vertexIndex - this.vertexOffset - 1;
                    const textureIndex = vertex.textureCoordsIndex - this.textureOffset - 1;

                    const pos = model.vertices[vertexIndex];
                    const tex = model.textureCoords[textureIndex];

                    triangle.push({ pos: vec3.create(pos.x, pos.y, pos.z), u: tex.u, v: 1 - tex.v });
                });

                // TODO: calculate via compute shader
                // const normal = vec3.cross(vec3.sub(triangle[1]!.pos, triangle[0]!.pos), vec3.sub(triangle[2]!.pos, triangle[0]!.pos));

                for(const vertex of triangle) {
                    vertexData.push(...vertex.pos, vertex.u, vertex.v, ...[0, 1, 0]);
                }
            }
        }

        const mesh = new MeshComponent(new Float32Array(vertexData), model.name);

        gameObject.components.add(mesh);

        return gameObject;
    }
}

