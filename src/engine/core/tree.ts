import {Entity} from "../../entity";
import {GameObject} from "../../game-object";

export class Tree extends Entity {
    root: Node;

    private id_node = new Map();

    override async setup() {
        this.root = new Node(new GameObject());
        this.id_node.set(this.root.gameObject.ID, this.root);
    }

    getRoot() {
        return this.root.gameObject;
    }

    getChildren(gameObject: GameObject): GameObject[] {
        const node = this.getNodeByGameObject(gameObject);

        return node.children.map(n => n.gameObject);
    }

    addGameObject(gameObject: GameObject) {
        const existingNode = this.id_node.get(gameObject.ID);

        if (existingNode) {
            this.root.addChild(existingNode);
            return;
        }

        const node = new Node(gameObject);

        this.id_node.set(gameObject.ID, node);
        this.root.addChild(node);
    }

    createGameObject() {
        const gameObject = new GameObject();
        const node = new Node(gameObject);

        this.id_node.set(gameObject.ID, node);

        return gameObject;
    }

    spawnGameObject() {
        const gameObject = this.createGameObject();

        this.addGameObject(gameObject);

        return gameObject;
    }

    addChildTo(parent: GameObject, child: GameObject) {
        const parentNode = this.getNodeByGameObject(parent);
        const childNode = this.getNodeByGameObject(child);

        parentNode.addChild(childNode);
    }

    applyToAll(callback: (gameObject: GameObject) => void) {
        const q = [this.root];

        while(q.length) {
            const n = q[0];

            callback(n.gameObject);

            q.shift();
            q.push(...n.children);
        }
    }

    private getNodeByGameObject(gameObject: GameObject) {
        return this.id_node.get(gameObject.ID);
    }
}

class Node {
    children: Node[] = [];
    parent: Node | null = null;
    gameObject: GameObject;

    constructor(gameObject: GameObject) {
        this.gameObject = gameObject;
    }

    addChild(child: Node) {
        child.parent?.removeChild(child);

        this.children.push(child);
        child.parent = this;
    }

    removeChild(child: Node) {
        const index = this.children.indexOf(child);

        // index is always >= 0
        this.children.splice(index, 1);

        child.parent = null;
    }
}