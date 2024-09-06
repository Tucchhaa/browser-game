export interface SceneObject {
    ID: number,
    name: string,
    components?: {
        name: string,
    }[],
    model?: string,
    material?: string,
    /**
     * Collider shapes
     */
    shapes: Shape[],
    children?: SceneObject[]
}

export interface Shape {
    shapeID: number,
    type: ShapeType
}

export type ShapeType = 'Box' | 'sphere';

export interface SceneDataRequest {
    type: "sceneData",
    sceneName: string,
}

export interface SceneDataResponse {
    type: "sceneData",
    sceneName: string,
    root: SceneObject
}

// ===

export interface SyncRequest {
    type: "sync",
    send_timestamp: number,
    input: {}
}

export interface TransformSync {
    gameObjectID: number,
    position: [number, number, number],
    rotation: [number, number, number, number],
    scale: [number, number, number],
    shapeTransforms: ShapeTransformSync[]
}

export interface ShapeTransformSync {
    shapeID: number,
    position: [number, number, number],
    rotation: [number, number, number, number],
    scale: [number, number, number],
}

export interface SyncResponse {
    type: "sync",
    send_timestamp: number,
    transform: TransformSync[],
}

// ===

export type RequestMessage = SceneDataRequest | SyncRequest;
export type ResponseMessage = SceneDataResponse | SyncResponse;