import { EngineEventListener } from "./engine-event-listener";
import { NETWORK_REQUESTS_PER_SECOND } from "../const";
import { engine } from "./engine";

export type ObjectSyncRequest = TransformRequest;

interface TransformRequest {
    type: "transform",
    gameObjectID: number,
}

interface SyncRequest {
    send_timestamp: number,
    requests: TransformRequest[],
    input: {}
}

interface SceneObject {
    name: string,
    components?: {
        name: string,
    }[],
    model?: string,
    material?: string,
    objects?: SceneObject[]
}

type Message = {
    type: "requestSceneData",
    sceneName: string,
    data?: {
        objects: SceneObject[]
    }
} | {
    type: "sync"
};

// type == loadScene
export class Network extends EngineEventListener {
    private readonly socketURL: string;
    private socket: WebSocket;

    private interval: number;

    private requestScenePromiseResolve;
    private requestScenePromiseReject;

    get opened() { return this.socket?.readyState === WebSocket.OPEN; }

    constructor(socketURL: string) {
        super();

        this.socketURL = socketURL;
    }

    async open() {
        const that = this;

        return new Promise((resolve, reject) => {
            const socket = new WebSocket(this.socketURL);

            socket.onopen = function(e) {
                that.setUpSocket(socket);

                console.info("[open] Connection established");

                resolve(true);
            }
        });
    }

    start() {
        if(this.interval)
            clearInterval(this.interval);

        this.interval = setInterval(() => {
            if(!this.opened) {
                clearInterval(this.interval);
                return;
            }

            const request = this.prepareSyncRequest();
            this.socket.send(JSON.stringify(request));
        }, 1000 / NETWORK_REQUESTS_PER_SECOND);
    }

    async requestSceneObjects(sceneName: string): Promise<SceneObject[]> {
        this.socket.send(
            JSON.stringify({
                type: "requestSceneData",
                sceneName
            })
        );

        return new Promise((resolve, reject) => {
            this.requestScenePromiseResolve = resolve;
            this.requestScenePromiseReject = reject;
        });
    }

    private setUpSocket(socket: WebSocket) {
        const that = this;
        this.socket = socket;

        socket.onmessage = function(e) {
            const message = JSON.parse(e.data) as Message;

            switch (message.type) {
                case "requestSceneData":
                    that.requestScenePromiseResolve?.call(this, message.data);
                    break;
                case "sync":
                    break;
                default:
                    console.warn(`Unknown message type: ${(message as any).type}`);
            }

            console.log(`[message] Data received from server:`);
            console.log(message);

            // that.receiveData(message);
        }
    }

    private prepareSyncRequest(): SyncRequest {
        const requests: ObjectSyncRequest[] = [];

        for(const component of engine.scene.getSyncComponents()) {
            const request = component.createSyncRequest();
            requests.push(...request);
        }

        return {
            send_timestamp: Date.now(),
            requests,
            input: {}
        };
    }

    private receiveData(data: Message) {
        // EngineEventListener.receiveNetworkData(data);
    }
}

// ServerSync.syncTransform(true)
/*

{
    requests: [
        ['transform', gameObject_ID]
    ],
    input: {

    }
}

Network.send - called when client got the message from the server
Что мы будем отправлять:
* Трансформы
* Инпут

Network.add - adds a new object that will update the data sent to the server, and receive it

 */