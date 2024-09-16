import { EngineEventListener } from "./engine-event-listener";
import { InputData } from "./network.types";
import { engine } from "./engine";

enum KeyState {
    None,
    Up,
    Down,
    Pressed,
}

class BaseInput extends EngineEventListener {
    protected readonly keyCodes = [
        'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyW', 'Space', 'ShiftLeft'
    ];
    protected readonly keyStateMap: Map<string, KeyState> = new Map(); // states: down, up, pressed

    protected readonly mouseState = {
        leftButton: false,
        rightButton: false,
        deltaX: 0,
        deltaY: 0
    };

    override async setup() {
        for(const key of this.keyCodes)
            this.keyStateMap.set(key, KeyState.None);

        engine.canvas.addEventListener("click", e => {
            engine.canvas.requestPointerLock();
        });

        window.addEventListener("keydown", (e) => {
            this.keyStateMap.set(e.code, KeyState.Down);
        });
        window.addEventListener("keyup", (e) => {
            this.keyStateMap.set(e.code, KeyState.Up);
        });

        window.addEventListener("mousemove", (e) => {
            this.mouseState.deltaX = e.movementX;
            this.mouseState.deltaY = e.movementY;
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
}

export class Input extends BaseInput {
    private _deltaX = 0;
    private _deltaY = 0;

    private _shift = false;

    get deltaX() { return this._deltaX; }
    get deltaY() { return this._deltaY; }
    get deltaMouseX() { return this.mouseState.deltaX; }
    get deltaMouseY() { return this.mouseState.deltaY; }
    get shift() { return this._shift; }

    override beforeRender() {
        super.beforeRender();

        this.readInput();
    }

    readInput() {
        const posX = engine.input.isKeyPressed("KeyD") ? 1 : 0;
        const negX = engine.input.isKeyPressed("KeyA") ? -1 : 0;
        const posY = engine.input.isKeyPressed("KeyW") ? 1 : 0;
        const negY = engine.input.isKeyPressed("KeyS") ? -1 : 0;

        this._deltaX = posX + negX;
        this._deltaY = posY + negY;
        this._shift = engine.input.isKeyPressed("ShiftLeft");
    }

    getInputData(): InputData {
        return {
            deltaX: this.deltaX,
            deltaZ: this.deltaY,
            deltaMouseX: this.deltaMouseX,
            deltaMouseY: this.deltaMouseY,
            shift: this.shift,
            mouseLeftButton: engine.input.isLeftButtonPressed(),
            mouseRightButton: engine.input.isRightButtonPressed(),
        }
    }

    isKeyPressed(key: string) {
        return [KeyState.Down, KeyState.Pressed].indexOf(this.keyStateMap.get(key)) !== -1;
    }

    isLeftButtonPressed() {
        return this.mouseState.leftButton;
    }

    isRightButtonPressed() {
        return this.mouseState.rightButton;
    }
}
