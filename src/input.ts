import { Entity } from "./entity";

const keyCodes = [
    'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyW', 'Space', 'ShiftLeft'
];

enum KeyState {
    Up,
    Down,
    Pressed
}

export class Input extends Entity {

    keyStateMap: Map<string, KeyState> = new Map(); // states: down, up, pressed

    constructor() {
        super();
    }

    override async setup() {
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));
    }

    onKeyDown(e: KeyboardEvent) {
        this.keyStateMap.set(e.code, KeyState.Down);
    }

    onKeyUp(e: KeyboardEvent) {
        this.keyStateMap.set(e.code, KeyState.Up);
    }
}
