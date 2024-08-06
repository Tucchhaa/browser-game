import {Component} from "./component";
import {engine} from "../../engine";
import {vec3} from "wgpu-matrix";

const speed = 0.1;

export class CharacterController extends Component {
    posX = 0;
    negX = 0;
    posY = 0;
    negY = 0;

    shift = false;

    override beforeRender() {
        this.readInput();
        this.move();
    }

    private readInput() {
        this.posX = engine.input.isKeyPressed("KeyD") ? 1 : 0;
        this.negX = engine.input.isKeyPressed("KeyA") ? -1 : 0;
        this.posY = engine.input.isKeyPressed("KeyW") ? 1 : 0;
        this.negY = engine.input.isKeyPressed("KeyS") ? -1 : 0;

        this.shift = engine.input.isKeyPressed("ShiftLeft");
    }

    private move() {
        let translation = vec3.create(
            this.posX + this.negX,
            0,
            -(this.posY + this.negY),
        );
        translation = vec3.mulScalar(translation, speed);

        this.transform.translate(translation);
    }
}