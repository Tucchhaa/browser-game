export class Entity {
    private static entities: Entity[] = [];

    constructor() {
        Entity.entities.push(this);
    }

    static async setup() {
        for (const entity of Entity.entities) {
            await entity.setup();
        }
    }

    static async teardown() {
        for (const entity of Entity.entities) {
            await entity.teardown();
        }
    }

    async setup() {}

    async teardown() {}

    beforeRender() {}

    afterRender() {}
}
