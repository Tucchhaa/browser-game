import { EngineEventListener } from "./engineEventListener";

const keyCodes = [
    'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyW', 'Space', 'ShiftLeft'
];

enum KeyState {
    None,
    Up,
    Down,
    Pressed,
}

export class Input extends EngineEventListener {
    private keyStateMap: Map<string, KeyState> = new Map(); // states: down, up, pressed

    override async setup() {
        for(const key of keyCodes)
            this.keyStateMap.set(key, KeyState.None);

        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));
    }

    private onKeyDown(e: KeyboardEvent) {
        this.keyStateMap.set(e.code, KeyState.Down);
    }

    private onKeyUp(e: KeyboardEvent) {
        this.keyStateMap.set(e.code, KeyState.Up);
    }

    override beforeRender() {
        for(const key of keyCodes) {
            const state = this.keyStateMap.get(key);

            if (state === KeyState.Up)
                this.keyStateMap.set(key, KeyState.None);

            if (state === KeyState.Down)
                this.keyStateMap.set(key, KeyState.Pressed);
        }
    }

    isKeyPressed(key: string) {
        return [KeyState.Down, KeyState.Pressed].indexOf(this.keyStateMap.get(key)) !== -1;
    }
}
