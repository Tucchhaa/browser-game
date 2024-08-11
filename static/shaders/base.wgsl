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

@group(0) @binding(0) var<uniform> camera: Camera;

@group(1) @binding(0) var<uniform> transform: mat4x4f;
@group(1) @binding(1) var<uniform> material: Material;

@vertex fn vertex_main(
    @location(0) position: vec3f,
    @location(1) uv: vec2f,
    @location(2) normal: vec3f,
    @builtin(vertex_index) index: u32
) -> @builtin(position) vec4f {
    var perspective: mat4x4f = camera.projectionMatrix * camera.viewMatrix;

    return perspective * transform * vec4f(position, 1.0);
}

@fragment fn fragment_main() -> @location(0) vec4f {
    return vec4f(material.Kd, 1.0);
}