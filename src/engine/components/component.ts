import { EngineEventListener } from "../core/engine-event-listener";
import { GameObject } from "../core/game-object";

export class Component extends EngineEventListener {
    gameObject: GameObject;

    get transform() { return this.gameObject.transform; }

    attachTo(gameObject: GameObject) {
        this.gameObject = gameObject;
    }
}
