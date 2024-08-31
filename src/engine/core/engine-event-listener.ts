export class EngineEventListener {
    private static entities: EngineEventListener[] = [];

    constructor() {
        EngineEventListener.entities.push(this);
    }

    async setup() {}

    async teardown() {}

    beforeRender() {}

    afterRender() {}

    /**
     * Called when engine.start() is called
     *
     * If you need to handle user's data supplied to scene, it should be done here
     */
    onStart() {}

    /**
     * Called when canvas is resized
     */
    onResize() { }

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

    static onStart() {
        for (const entity of EngineEventListener.entities)
            entity.onStart();
    }

    static onResize() {
        for (const entity of EngineEventListener.entities)
            entity.onResize();
    }
}
