import { ShaderFactory } from "./shader"

window.addEventListener('load', main);

async function main() {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter?.requestDevice();

    if (device === undefined) {
        throw new Error("WebGPU is not supported on this device");
    }

    const canvas = document.getElementById("main_canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("webgpu")! as unknown as GPUCanvasContext;
    const format = navigator.gpu.getPreferredCanvasFormat();

    canvas.width = window.screen.width;
    canvas.height = window.screen.height;

    ctx.configure({ device, format });

    const shaderFactory = new ShaderFactory(device);
    const shader = await shaderFactory.createGraphicsShader("base.wgsl");

    const pipeline = device.createRenderPipeline({
        label: 'render pipeline',
        layout: 'auto',
        vertex: {
            module: shader.module,
        },
        fragment: {
            module: shader.module,
            targets: [{ format }]
        },
        primitive: {
            topology: "triangle-list",
        }
    });

    const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [{
            clearValue: [0.3, 0.3, 0.3, 1],
            loadOp: 'clear',
            storeOp: 'store',
            view : ctx.getCurrentTexture().createView()
        }]
    };

    const encoder = device.createCommandEncoder();

    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
    pass.draw(3);
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
}
