// ===
// Scene Data
// ===

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
// Player Data
// ===

export interface PlayerDataRequest {
    type: "playerData",
}

export interface PlayerDataResponse {
    type: "playerData",
    gameObjectID: number,
}

// ===
// Sync
// ===

export interface InputData {
    deltaX: number,
    deltaZ: number,
    deltaMouseX: number,
    deltaMouseY: number,
    shift: boolean,
    mouseLeftButton: boolean,
    mouseRightButton: boolean,
}

export interface SyncRequest {
    type: "sync",
    send_timestamp: number,
    input: InputData,
}

export interface TransformSync {
    gameObjectID: number,
    visible: boolean,
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

export type RequestMessage = SceneDataRequest | PlayerDataRequest | SyncRequest;
export type ResponseMessage = SceneDataResponse | PlayerDataResponse | SyncResponse;