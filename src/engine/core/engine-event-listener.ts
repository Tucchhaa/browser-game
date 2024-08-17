
export class EngineEventListener {
    private static entities: EngineEventListener[] = [];

    constructor() {
        EngineEventListener.entities.push(this);
    }

    async setup() {}

    async teardown() {}

    beforeRender() {}

    afterRender() {}

    static async setup() {
        for (const entity of EngineEventListener.entities)
            await entity.setup();
    }

    static async teardown() {
        for (const entity of EngineEventListener.entities)
            await entity.teardown();
    }

    static beforeRender() {
        for (const entity of EngineEventListener.entities)
            entity.beforeRender();
    }

    static afterRender() {
        for (const entity of EngineEventListener.entities)
            entity.afterRender();
    }
}
