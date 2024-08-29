struct Camera {
    viewMatrix: mat4x4f,
    projectionMatrix: mat4x4f,
    position: vec3f
};

struct Vertex {
    @builtin(position) fragPosition: vec4f,
    @location(0) worldPosition: vec3f,
}

@group(0) @binding(0) var<uniform> camera: Camera;
@group(1) @binding(0) var<uniform> transform: mat4x4f;

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

    return vertex;
}

@fragment fn fragment_main(vertex: Vertex) -> @location(0) vec4f {
    return vec4f(0.0, 1.0, 0.0, 1.0);
}
