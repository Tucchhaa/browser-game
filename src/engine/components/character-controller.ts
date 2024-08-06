import { Component } from "./component";
import { engine } from "../core/engine";
import { quat, vec3 } from "wgpu-matrix";
import { WorldTransform } from "./transform";

const speed = 0.1;
const rotationSpeed = 0.02;

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
        if(this.shift) {
            const yRotation = quat.fromEuler(0,(this.posX + this.negX) * rotationSpeed, 0, 'xyz');
            const xRotation = quat.fromEuler((this.posY + this.negY) * rotationSpeed, 0, 0, 'xyz');

            this.transform.rotate(yRotation);
            this.transform.rotate(xRotation, WorldTransform);
        }
        else {
            const translation = vec3.create(
                (this.posX + this.negX) * speed,
                0,
                -(this.posY + this.negY) * speed,
            );

            this.transform.translate(translation);
        }
    }
}