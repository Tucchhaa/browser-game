import { EngineEventListener, GameObject } from "../core";

export class Component extends EngineEventListener {
    // Negative ID means that the object is on the client side
    ID: number;

    gameObject: GameObject;

    constructor() {
        super();

        this.ID = Component.generateID();
    }

    static count = 0;

    static generateID() {
        return -(++Component.count);
    }

    get transform() { return this.gameObject.transform; }

    attachTo(gameObject: GameObject) {
        this.gameObject = gameObject;
    }
}
