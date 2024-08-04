import {Component} from "./engine/components/component";

type ComponentType<T extends Component> = new (...args: any[]) => T;

export class GameObject {
    components: ComponentsManager;
    ID: number;

    constructor() {
        this.components = new ComponentsManager();
        this.ID = GameObject.generateID();
    }

    static count = 0;

    static generateID() {
        return GameObject.count++;
    }
}

class ComponentsManager {
    private components: Component[] = [];

    add(component: Component) {
        this.components.push(component);
    }

    get<T extends Component>(type: ComponentType<T>): T {
        return this.components.find(c => c instanceof type) as T;
    }
}
