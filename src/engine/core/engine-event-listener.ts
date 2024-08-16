
export class EngineEventListener {
    private static entities: EngineEventListener[] = [];

    constructor() {
        EngineEventListener.entities.push(this);
    }

    async setup() {}

    async teardown() {}

    prepareSendData(data: any) {}

    receiveNetworkData(data: any) {}

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

    static prepareNetworkData(data: any) {
        for (const entity of EngineEventListener.entities)
            entity.prepareSendData(data);
    }

    static receiveNetworkData(data: any) {
        for(const entity of EngineEventListener.entities)
            entity.receiveNetworkData(data);
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
