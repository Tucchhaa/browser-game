import { EngineEventListener, engine } from ".";
import {
    ResponseMessage,
    SceneDataRequest,
    SceneObject,
    SyncRequest,
    SyncResponse
} from "./network.types";
import { Sync } from "../components";

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

            this.sendSyncRequest();
        }, 1000 / 2);
    }

    async requestSceneObjects(sceneName: string): Promise<SceneObject[]> {
        this.socket.send(
            JSON.stringify({
                type: "sceneData",
                sceneName
            } as SceneDataRequest)
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
            const message = JSON.parse(e.data) as ResponseMessage;

            switch (message.type) {
                case "sceneData":
                    that.requestScenePromiseResolve?.call(this, message.data);
                    break;
                case "sync":
                    that.sync(message);
                    break;
                default:
                    console.warn(`Unknown message type: ${(message as any).type}`);
            }
        }
    }

    private sendSyncRequest() {
        this.socket.send(JSON.stringify({
            type: "sync",
            send_timestamp: Date.now(),
            input: {}
        }));
    }

    private sync(message: SyncResponse) {
        debugger;
        for(const transformData of message.transform) {
            const gameObject = engine.tree.getGameObjectByID(transformData.gameObjectID);

            if(!gameObject)
                continue;

            const syncComponent = gameObject.components.getOptional(Sync);

            syncComponent?.syncTransform(transformData);
        }
    }

    private receiveData(data: ResponseMessage) {
        // EngineEventListener.receiveNetworkData(data);
    }
}
