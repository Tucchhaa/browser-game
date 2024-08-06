import { Entity } from "../core/entity";
import { GameObject } from "../core/game-object";

export class Component extends Entity {
    gameObject: GameObject;

    get transform() { return this.gameObject.transform; }

    attachTo(gameObject: GameObject) {
        this.gameObject = gameObject;
    }
}
