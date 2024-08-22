import { Component } from "./component";
import { TransformSyncData } from "../core/network.types";
import { quat, vec3 } from "wgpu-matrix";

export class Sync extends Component {
    syncTransform(transformData: TransformSyncData) {
        this.transform.position = vec3.create(...transformData.position);
        this.transform.rotation = quat.create(...transformData.rotation);
        this.transform.scale    = vec3.create(...transformData.scale);
    }
}