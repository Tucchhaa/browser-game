import OBJFile from 'obj-file-parser';
import MTLFile from 'mtl-file-parser'
import { GameObject } from "./game-object";
import { engine } from "./engine";
import { vec3, Vec3 } from "wgpu-matrix";
import { MeshComponent } from "../components/mesh";
import { Material } from "../resources/material";
import { Texture } from "../resources/texture";

export class Loader {
    constructor() { }

    async loadMesh(filepath: string, mtlFilepath?: string) {
        const extension = filepath.split('.').pop();

        switch (extension) {
            case 'obj':
                return await this.loadOBJ(filepath, mtlFilepath);
            default:
                throw new Error(`Extension \'${extension}\' is not supported`);
        }
    }

    async loadTexture(filepath: string) {
        const response = await this.load(filepath);
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob, { colorSpaceConversion: 'none' });

        return new Texture(filepath, bitmap.width, bitmap.height, 'rgba8unorm', bitmap);
    }

    async loadTextFile(filepath: string) {
        const response = await this.load(filepath);

        return await response.text();
    }

    private async loadOBJ(filepath: string, mtlFilepath?: string) {
        const raw = await this.loadTextFile(filepath);
        const mtlRaw = mtlFilepath ? await this.loadTextFile(mtlFilepath) : undefined;

        return new OBJParser().parse(raw, mtlRaw);
    }

    private async load(filepath: string) {
        const response = await fetch(filepath);

        if (!response.ok)
            throw new Error(`Failed to load file: ${filepath}`);

        return response;
    }
}

class OBJParser {
    vertexOffset = 0;
    textureOffset = 0;

    materials: Map<string, Material> = new Map();

    parse(raw: string, mtlRaw?: string): GameObject {
        const obj = new OBJFile(raw).parse();

        const gameObject = engine.tree.createGameObject();

        if(mtlRaw) {
            this.parseMaterials(mtlRaw);
        }

        for(const model of obj.models) {
            const childGameObject = this.parseModel(model);

            engine.tree.addChildTo(gameObject, childGameObject);

            this.vertexOffset += model.vertices.length;
            this.textureOffset += model.textureCoords.length;
        }

        return gameObject;
    }

    parseMaterials(raw: string) {
        const mtls = new MTLFile(raw).parse();

        for (let i=0; i < mtls.length; i++) {
            const mtl = mtls[i];

            this.materials.set(mtl.name, new Material({
                name: mtl.name,
                Kd: vec3.create(mtl.Kd.red, mtl.Kd.green, mtl.Kd.blue),
                Ks: vec3.create(mtl.Ks.red, mtl.Ks.green, mtl.Ks.blue),
                Ka: vec3.create(mtl.Ka.red, mtl.Ka.green, mtl.Ka.blue),
                diffuse: mtl.map_Kd.file,
                specular: mtl.map_Ks.file,
                ao: mtl.map_Ka.file
            }));
        }
    }

    parseModel(model: OBJFile.ObjModel): GameObject {
        const gameObject = engine.tree.createGameObject();
        let vertexData = [];
        let currentMaterialName = model.faces[0].material;

        const addMesh = () => {
            const mesh = new MeshComponent(new Float32Array(vertexData), model.name);
            const material = this.materials.get(currentMaterialName);

            if(material) {
                mesh.material = material;
            }

            gameObject.components.add(mesh);
        }

        for(let i=0; i < model.faces.length; i++) {
            const face = model.faces[i];

            if(i > 0 && model.faces[i-1].material !== face.material) {
                addMesh();

                vertexData = [];
                currentMaterialName = face.material;
            }

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

        addMesh();

        return gameObject;
    }
}

