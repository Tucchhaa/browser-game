import { ShapeTransformSync, TransformSync } from "../core/network.types";
import { quat, vec3 } from "wgpu-matrix";
import { Component, Collider } from ".";

export class Sync extends Component {
    syncTransform(transform: TransformSync) {
        this.transform.position = vec3.create(...transform.position);
        this.transform.rotation = quat.create(...transform.rotation);
        this.transform.scale    = vec3.create(...transform.scale);
    }

    syncColliders(shapeTransforms: ShapeTransformSync[]) {
        if(!shapeTransforms?.length)
            return;

        const collider = this.gameObject.components.get(Collider);

        for(const shapeTransform of shapeTransforms) {
            for(const [shapeID, {transform}] of collider.meshes.entries()) {
                if(shapeID === shapeTransform.shapeID) {
                    transform.position = vec3.create(...shapeTransform.position);
                    transform.rotation = quat.create(...shapeTransform.rotation);
                    transform.scale = vec3.create(...shapeTransform.scale);

                    transform.updateAbsoluteValues();
                }
            }
        }

    }

} // Sync