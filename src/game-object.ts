import {Component} from "./engine/components/component";
import {Transform} from "./engine/components/transform";

type ComponentType<T extends Component> = new (...args: any[]) => T;

export class GameObject {
    ID: number;
    components: ComponentsManager;
    transform: Transform;

    constructor() {
        this.ID = GameObject.generateID();
        this.components = new ComponentsManager(this);
        this.transform = new Transform();

        this.components.add(this.transform);
    }

    static count = 0;

    static generateID() {
        return GameObject.count++;
    }
}

class ComponentsManager {
    private readonly _gameObject: GameObject;
    private _components: Component[];

    constructor(gameObject: GameObject) {
        this._gameObject = gameObject;
        this._components = [];
    }

    add(component: Component) {
        this._components.push(component);
        component.attachTo(this._gameObject);
    }

    get<T extends Component>(type: ComponentType<T>): T {
        return this._components.find(c => c instanceof type) as T;
    }
}
