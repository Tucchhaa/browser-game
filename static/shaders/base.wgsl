struct Camera {
    viewMatrix: mat4x4f,
    projectionMatrix: mat4x4f,
    position: vec3f
};

struct Material {
    Kd: vec3f,
    Ks: vec3f,
    Ka: vec3f,
}

struct DirectLight {
    color: vec3f,
    intensity: f32,
    direction: vec3f,
}

struct PointLight {
    position: vec3f,
    intensity: f32,
    color: vec3f,
    range: f32,
}

struct Vertex {
    @builtin(position) fragPosition: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) uv: vec2f,
    @location(2) normal: vec3f,
}

@group(0) @binding(0) var<uniform> camera: Camera;
@group(0) @binding(1) var<storage, read> directLights: array<DirectLight>;
@group(0) @binding(2) var<storage, read> pointLights: array<PointLight>;

@group(1) @binding(0) var<uniform> transform: mat4x4f;
@group(1) @binding(1) var<uniform> material: Material;

@vertex fn vertex_main(
    @location(0) position: vec3f,
    @location(1) uv: vec2f,
    @location(2) normal: vec3f,
) -> Vertex {
    var perspective: mat4x4f = camera.projectionMatrix * camera.viewMatrix;
    var worldPosition: vec4f = transform * vec4f(position, 1.0);

    var vertex: Vertex;

    vertex.fragPosition = perspective * worldPosition;
    vertex.worldPosition = worldPosition.xyz;
    vertex.uv = uv;
    vertex.normal = normal;

    return vertex;
}

@fragment fn fragment_main(vertex: Vertex) -> @location(0) vec4f {
    var color = vec3f(0.0, 0.0, 0.0);
    var normal = normalize(vertex.normal);
    var cameraDir = normalize(camera.position - vertex.worldPosition);

    for(var i=0u; i < arrayLength(&directLights); i++) {
        color += calc_direct_light(directLights[i], cameraDir, normal);
    }

    return vec4f(color, 1.0);
}

fn calc_direct_light(light: DirectLight, cameraDir: vec3f, normal: vec3f) -> vec3f {
    var lightDir = -light.direction;

    var diffuse: f32 = max(dot(normal, lightDir), 0.0);
    var specular: f32 = calc_blinn_phong_coef(cameraDir, lightDir, normal);

    return light.color * light.intensity * (diffuse * material.Kd + material.Ks * specular);
}

fn calc_blinn_phong_coef(cameraDir: vec3f, lightDir: vec3f, normal: vec3f) -> f32 {
    var halfway: vec3f = normalize(cameraDir + lightDir);

    return pow(max(dot(normal, halfway), 0.0), 32.0 * 5.0);
}
