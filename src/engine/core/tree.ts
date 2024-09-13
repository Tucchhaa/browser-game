import { EngineEventListener, GameObject } from ".";

export class Tree extends EngineEventListener {
    readonly root: GameObject;

    private readonly id_gameObject: Map<number, GameObject>;

    constructor() {
        super();

        this.root = new GameObject();
        this.id_gameObject = new Map();
    }

    getGameObjectByID(ID: number) {
        return this.id_gameObject.get(ID);
    }

    addChild(parent: GameObject, child: GameObject) {
        // assert: parent doesn't already have this child

        if(child.parent)
            this.removeChild(child.parent, child);

        this.id_gameObject.set(child.ID, child);
        parent.children.push(child);
        child.parent = parent;
        child.visible = parent.visible;
    }

    removeChild(parent: GameObject, child: GameObject) {
        // assert: index is always >= 0
        const index = parent.children.indexOf(child);

        this.id_gameObject.delete(child.ID);
        parent.children.splice(index, 1);

        child.parent = null;
    }

    addGameObject(gameObject: GameObject) {
        this.id_gameObject.set(gameObject.ID, gameObject);
        this.addChild(this.root, gameObject);
    }

    static createGameObject() {
        return new GameObject();
    }

    spawnGameObject() {
        const gameObject = Tree.createGameObject();

        this.addGameObject(gameObject);

        return gameObject;
    }

    traverse(callback: (gameObject: GameObject) => void) {
        Tree.traverseChildren(this.root, callback);
    }

    updateTransforms() {
        this.traverse(gameObject => gameObject.transform.updateAbsoluteValues());
    }

    static traverseChildren(gameObject: GameObject, callback: (gameObject: GameObject) => void) {
        const q = [gameObject];

        while(q.length) {
            const n = q[0];

            callback(n);

            q.shift();
            q.push(...n.children);
        }
    }
}
