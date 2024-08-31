@group(0) @binding(0) var<storage, read> lightPerspectives: array<mat4x4f>;
@group(1) @binding(0) var<uniform> transform: mat4x4f;
@group(2) @binding(0) var<uniform> cascadeIndex: u32;

@vertex
fn main(
  @location(0) position: vec3f
) -> @builtin(position) vec4f {
    var lightPerspective: mat4x4f = lightPerspectives[cascadeIndex];

    return lightPerspective * transform * vec4(position, 1.0);
}
