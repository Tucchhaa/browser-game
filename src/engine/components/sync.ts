import { Component } from "./component";
import { ObjectSyncRequest } from "../core/network";

export class Sync extends Component {
    createSyncRequest(): ObjectSyncRequest[] {
        if(!this.gameObject.isServerSide)
            return;

        return [{
            gameObjectID: this.gameObject.ID,
            type: 'transform'
        }]
    }
}