import { EngineEventListener } from "./engine-event-listener";
import { InputData } from "./network.types";

enum KeyState {
    None,
    Up,
    Down,
    Pressed,
}

export class Input extends EngineEventListener {
    private readonly keyCodes = [
        'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyW', 'Space', 'ShiftLeft'
    ];
    private readonly keyStateMap: Map<string, KeyState> = new Map(); // states: down, up, pressed

    private readonly mouseState = {
        leftButton: false,
        rightButton: false,
    };

    override async setup() {
        for(const key of this.keyCodes)
            this.keyStateMap.set(key, KeyState.None);

        window.addEventListener("keydown", (e) => {
            this.keyStateMap.set(e.code, KeyState.Down);
        });
        window.addEventListener("keyup", (e) => {
            this.keyStateMap.set(e.code, KeyState.Up);
        });

        window.addEventListener("mousemove", (e) => {
        });
        window.addEventListener("mousedown", (e) => {
            if(e.button === 0)
                this.mouseState.leftButton = true;
            if(e.button === 2)
                this.mouseState.rightButton = true;
        });
        window.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        })
        window.addEventListener("mouseup", (e) => {
            if(e.button === 0)
                this.mouseState.leftButton = false;
            if(e.button === 2)
                this.mouseState.rightButton = false;
        });
    }

    override beforeRender() {
        for(const key of this.keyCodes) {
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

    getInputData(): InputData {
        const keyboard = {
            forward: this.isKeyPressed('KeyW'),
            backward: this.isKeyPressed('KeyS'),
            left: this.isKeyPressed('KeyA'),
            right: this.isKeyPressed('KeyD'),
            jump: this.isKeyPressed('Space'),
        }

        return {
            keyboard,
            mouse: this.mouseState
        }
    }
}
