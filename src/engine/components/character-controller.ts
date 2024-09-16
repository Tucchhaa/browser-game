import { quat, vec3 } from "wgpu-matrix";

import { engine, GameObject } from "../core";
import { Component, WorldTransform } from ".";

const speed = 0.1;
const rotationSpeed = 0.02;

export class FreeCameraController extends Component {
    override beforeRender() {
        this.move();
    }

    private move() {
        const { shift, deltaX, deltaY } = engine.input;

        if(shift) {
            const yRotation = quat.fromEuler(0,deltaX * rotationSpeed, 0, 'xyz');
            const xRotation = quat.fromEuler(deltaY * rotationSpeed, 0, 0, 'xyz');

            this.transform.rotate(yRotation);
            this.transform.rotate(xRotation, WorldTransform);
        }
        else {
            const translation = vec3.create(
                deltaX * speed,
                0,
                -deltaY * speed,
            );

            this.transform.translate(translation);
        }
    }
}

export class CharacterController extends Component {
    private characterObject?: GameObject;
    private deltaPosition = vec3.create(0, 2, 5);

    setCharacterObject(characterObject: GameObject) {
        this.characterObject = characterObject;
    }

    override beforeRender() {
        if(this.characterObject === undefined) {
            return;
        }

        this.move();
    }

    private move() {
        this.transform.position =  vec3.add(
            this.characterObject.transform.position, this.deltaPosition
        );

        const { shift, deltaX, deltaY } = engine.input;

        if(shift) {
            const yRotation = quat.fromEuler(0,deltaX * rotationSpeed, 0, 'xyz');
            const xRotation = quat.fromEuler(deltaY * rotationSpeed, 0, 0, 'xyz');

            this.transform.rotate(yRotation);
            this.transform.rotate(xRotation, WorldTransform);
        }
    }
}
