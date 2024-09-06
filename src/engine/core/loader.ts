import { Vec2, vec2, vec3, Vec3 } from "wgpu-matrix";
import OBJFile from 'obj-file-parser';
import MTLFile from 'mtl-file-parser';

import { GameObject, engine, Scene, Tree } from ".";
import { Mesh, Sync, Collider } from "../components";
import { Texture, Material } from "../resources";
import { ShapeType, SceneObject } from "./network.types";

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

    async loadScene(scene: string) {
        const sceneRoot = await engine.network.requestSceneRoot(scene);

        const handleSceneObject = async (parent: GameObject, sceneObject: SceneObject) => {
            let gameObject: GameObject;

            const { shapes, model, material } = sceneObject;

            if(model) {
                const filepath = `assets/${model}`;
                const mtlFilepath = `assets/${material}`;

                gameObject = await this.loadMesh(filepath, mtlFilepath);
            }
            else {
                gameObject = Tree.createGameObject();
            }

            const syncComponent = new Sync();
            const colliderComponent = await Collider.create(shapes);

            gameObject.ID = sceneObject.ID;
            gameObject.components.add(syncComponent);
            gameObject.components.add(colliderComponent);

            engine.tree.addChild(parent, gameObject);

            for(const child of sceneObject.children) {
                await handleSceneObject(gameObject, child);
            }
        }

        await handleSceneObject(engine.tree.root, sceneRoot);

        return new Scene();
    }

    async loadShapeMesh(type: ShapeType) {
        const filenames = {
            "Box": "cube.obj",
            "sphere": "not def"
        };

        const raw = await this.loadTextFile(`assets/${filenames[type]}`);
        const colliderObject = new OBJParser(raw, undefined).parse();
        const collider = colliderObject.children[0].components.get(Mesh);

        collider.gameObject.components.remove(collider);

        return collider;
    }

    private async loadOBJ(filepath: string, mtlFilepath?: string) {
        const raw = await this.loadTextFile(filepath);
        const mtlRaw = mtlFilepath ? await this.loadTextFile(mtlFilepath) : undefined;

        return new OBJParser(raw, mtlRaw).parse();
    }

    private async load(filepath: string) {
        const response = await fetch(filepath);

        if (!response.ok)
            throw new Error(`Failed to load file: ${filepath}`);

        return response;
    }
}

class OBJParser {
    raw: string;
    mtlRaw?: string;

    vertexOffset = 0;
    textureOffset = 0;
    normalOffset = 0;

    materials: Map<string, Material> = new Map();

    constructor(raw: string, mtlRaw?: string) {
        this.raw = raw;
        this.mtlRaw = mtlRaw;
    }

    parse(): GameObject {
        const obj = new OBJFile(this.raw).parse();

        const gameObject = Tree.createGameObject();

        if(this.mtlRaw) {
            this.parseMaterials(this.mtlRaw);
        }

        for(const model of obj.models) {
            const child = this.parseModel(model);

            engine.tree.addChild(gameObject, child);

            this.vertexOffset += model.vertices.length;
            this.textureOffset += model.textureCoords.length;
            this.normalOffset += model.vertexNormals.length;
        }

        return gameObject;
    }

    parseMaterials(raw: string) {
        const originalConsoleWarn = console.warn;
        console.warn = () => {};

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

        console.warn = originalConsoleWarn;
    }

    parseModel(model: OBJFile.ObjModel): GameObject {
        const gameObject = Tree.createGameObject();
        let vertexData = [];
        let currentMaterialName = model.faces[0].material;

        const addMesh = () => {
            const mesh = new Mesh(new Float32Array(vertexData), model.name);
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
                const triangle: { pos: Vec3, uv: Vec2, normal: Vec3 }[] = [];

                [0, j, j + 1].map(vertexInd => {
                    const vertex = face.vertices[vertexInd]!;

                    const vertexIndex = vertex.vertexIndex - this.vertexOffset - 1;
                    const textureIndex = vertex.textureCoordsIndex - this.textureOffset - 1;
                    const normalIndex = vertex.vertexNormalIndex - this.normalOffset - 1;

                    const pos = model.vertices[vertexIndex];
                    const tex = model.textureCoords[textureIndex];
                    const normal = model.vertexNormals[normalIndex];

                    triangle.push({
                        pos: vec3.create(pos.x, pos.y, pos.z),
                        uv: vec2.create(tex.u, 1 - tex.v),
                        normal: vec3.create(normal.x, normal.y, normal.z)
                    });
                });

                // TODO: calculate via compute shader
                // const normal = vec3.cross(vec3.sub(triangle[1]!.pos, triangle[0]!.pos), vec3.sub(triangle[2]!.pos, triangle[0]!.pos));

                for(const vertex of triangle) {
                    vertexData.push(...vertex.pos, ...vertex.uv, ...vertex.normal);
                }
            }
        }

        addMesh();

        return gameObject;
    }
}

