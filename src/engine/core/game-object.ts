import { Transform, Component } from "../components";

type ComponentType<T extends Component> = new (...args: any[]) => T;

export class GameObject {
    // Negative ID means that the object is on the client side
    ID: number;

    components: ComponentsManager;
    transform: Transform;

    parent: GameObject;
    children: GameObject[];

    constructor() {
        this.ID = GameObject.generateID();
        this.components = new ComponentsManager(this);
        this.transform = new Transform();
        this.parent = null;
        this.children = [];

        this.components.add(this.transform);
    }

    get isServerSide() { return this.ID >= 0; }

    static count = 0;

    static generateID() {
        return -(++GameObject.count);
    }
}

class ComponentsManager {
    private readonly _gameObject: GameObject;
    private readonly _components: Component[];

    constructor(gameObject: GameObject) {
        this._gameObject = gameObject;
        this._components = [];
    }

    add(component: Component) {
        this._components.push(component);
        component.attachTo(this._gameObject);
    }

    remove(component: Component) {
        for(let i=0; i < this._components.length; i++) {
            if(component == this._components[i]) {
                this._components.splice(i, 1);
            }
        }
    }

    get<T extends Component>(type: ComponentType<T>): T {
        const result = this.getOptional(type);

        if(result === null)
            throw new Error(`Component ${type.name} not found`);

        return result;
    }

    getAll<T extends Component>(type: ComponentType<T>): T[] {
        return this._components.filter(c => c instanceof type) as T[];
    }

    getOptional<T extends Component>(type: ComponentType<T>): T | null {
        const result = this._components.find(c => c instanceof type) as T;

        if (result)
            return result;

        return null;
    }
}
