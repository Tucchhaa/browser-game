import { EngineEventListener, GameObject } from ".";

export class Tree extends EngineEventListener {
    readonly root: GameObject;

    constructor() {
        super();

        this.root = new GameObject();
    }

    addChild(parent: GameObject, child: GameObject) {
        // assert: parent doesn't already have this child

        if(child.parent)
            this.removeChild(parent, child);

        parent.children.push(child);
        child.parent = parent;
    }

    removeChild(parent: GameObject, child: GameObject) {
        // assert: index is always >= 0
        const index = parent.children.indexOf(child);

        parent.children.splice(index, 1);

        child.parent = null;
    }

    addGameObject(gameObject: GameObject) {
        this.addChild(this.root, gameObject);
    }

    createGameObject() {
        return new GameObject();
    }

    spawnGameObject() {
        const gameObject = this.createGameObject();

        this.addGameObject(gameObject);

        return gameObject;
    }

    applyToAll(callback: (gameObject: GameObject) => void) {
        this.traverseChildren(this.root, callback);
    }

    updateTransforms() {
        this.applyToAll(gameObject => gameObject.transform.updateAbsoluteValues());
    }

    private traverseChildren(gameObject: GameObject, callback: (gameObject: GameObject) => void) {
        const q = [gameObject];

        while(q.length) {
            const n = q[0];

            callback(n);

            q.shift();
            q.push(...n.children);
        }
    }
}
