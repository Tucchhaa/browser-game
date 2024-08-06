export class Entity {
    private static entities: Entity[] = [];

    constructor() {
        Entity.entities.push(this);
    }


    async setup() {}

    async teardown() {}

    beforeRender() {}

    afterRender() {}

    static async setup() {
        for (const entity of Entity.entities)
            await entity.setup();
    }

    static async teardown() {
        for (const entity of Entity.entities)
            await entity.teardown();
    }

    static beforeRender() {
        for (const entity of Entity.entities)
            entity.beforeRender();
    }

    static afterRender() {
        for (const entity of Entity.entities)
            entity.afterRender();
    }
}
