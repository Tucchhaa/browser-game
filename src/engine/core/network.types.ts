export interface SceneObject {
    ID: number,
    name: string,
    components?: {
        name: string,
    }[],
    model?: string,
    material?: string,
    objects?: SceneObject[]
}

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

export interface TransformSyncData {
    gameObjectID: number,
    position: [number, number, number],
    rotation: [number, number, number, number],
    scale: [number, number, number]
}

export interface SyncResponse {
    type: "sync",
    send_timestamp: number,
    transform: TransformSyncData[]
}

// ===

export type RequestMessage = SceneDataRequest | SyncRequest;
export type ResponseMessage = SceneDataResponse | SyncResponse;