import { vec3, Vec3 } from "wgpu-matrix";
import { Texture } from "./texture";

interface MaterialConfig {
    name: string;

    Kd: Vec3;
    Ks: Vec3;
    Ka: Vec3;

    diffuse: Texture;
    specular: Texture;
    metallic: Texture;
    roughness: Texture;
    ao: Texture;
}

export class Material {
    name: string;

    Kd: Vec3;
    Ks: Vec3;
    Ka: Vec3;

    diffuse: Texture;
    specular: Texture;
    metallic: Texture;
    roughness: Texture;
    ao: Texture;

    constructor(config: Partial<MaterialConfig>) {
        this.name = config.name ?? "unnamed material";

        this.Kd = config.Kd ?? vec3.create(1, 1, 1);
        this.Ks = config.Ks ?? vec3.create(1, 1, 1);
        this.Ka = config.Ka ?? vec3.create(1, 1, 1);

        this.diffuse   = config.diffuse   ?? Texture.defaultTexture;
        this.specular  = config.specular  ?? Texture.defaultTexture;
        this.metallic  = config.metallic  ?? Texture.defaultTexture;
        this.roughness = config.roughness ?? Texture.defaultTexture;
        this.ao        = config.ao        ?? Texture.defaultTexture;
    }
}