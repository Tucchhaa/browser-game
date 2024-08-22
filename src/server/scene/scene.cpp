#include "scene.hpp"

Scene::Scene() {
    name = "noname scene";

    physicsWorld = make_shared<PhysicsWorld>();
}

json Scene::getSceneRootJSON(const shared_ptr<GameObject>& gameObject) const {
    auto current = gameObject == nullptr ? tree.root : gameObject;

    vector<json> objects;

    for(const auto& child: current->children) {
        objects.push_back(getSceneRootJSON(child));
    }

    return {
        { "ID", current->ID },
        { "name", current->name },
        { "model", current->model },
        { "material", current->material },
        { "objects",  objects }
    };
}

json Scene::getTransformData() {
    vector<json> list;

    const auto getObjectTransformData = [&list](const shared_ptr<GameObject>& gameObject) {
        const auto transform = gameObject->transform;

        list.push_back({
            {"gameObjectID", gameObject->ID },
            {"position", {
                transform->getPosition().x(),
                transform->getPosition().y(),
                transform->getPosition().z()
            }},
            {"rotation", {
                transform->getRotation().x(),
                transform->getRotation().y(),
                transform->getRotation().z(),
                transform->getRotation().w(),
            }},
            {"scale", {
                transform->getScale().x(),
                transform->getScale().y(),
                transform->getScale().z()
            }}
        });
    };

    tree.traverse(getObjectTransformData);

    return list;
}

void Scene::tick(float dt) {
    physicsWorld->dynamicsWorld->stepSimulation(dt);
}
