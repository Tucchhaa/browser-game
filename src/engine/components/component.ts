import { EngineEventListener, GameObject } from "../core";

export class Component extends EngineEventListener {
    gameObject: GameObject;

    get transform() { return this.gameObject.transform; }

    attachTo(gameObject: GameObject) {
        this.gameObject = gameObject;
    }
}
