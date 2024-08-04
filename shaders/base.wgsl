@group(0) @binding(0) var<uniform> perspective: mat4x4f;

@vertex fn vertex_main(
    @location(0) position: vec3f,
    @location(1) uv: vec2f,
    @location(2) normal: vec3f,
    @builtin(vertex_index) index: u32
) -> @builtin(position) vec4f {
    return perspective * vec4f(position, 1.0);
}

@fragment fn fragment_main() -> @location(0) vec4f {
    return vec4f(1.0, 0.0, 0.0, 1.0);
}