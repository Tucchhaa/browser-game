#include "scene.hpp"

Scene::Scene() {
    name = "noname scene";

    physicsWorld = make_shared<PhysicsWorld>();
}

vector<json> Scene::getObjectsList() {
    vector<json> list;

    // TODO: implement nested objects
    auto prepareObjectJSON = [&list](const shared_ptr<GameObject>& gameObject) {
        list.push_back({
            { "ID", gameObject->ID },
            { "name", gameObject->name },
            { "model", gameObject->model },
            { "material", gameObject->material }
        });
    };

    tree.traverse(prepareObjectJSON);

    return list;
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
