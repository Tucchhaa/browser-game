#include "scene.hpp"

#include <crow/logging.h>

#include "components/collider.hpp"

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

    vector<json> shapes;

    const auto collider = current->components.getOptional<Collider>();

    if(collider) {
        for(const auto& shape: collider->shapes()) {
            shapes.push_back({
                { "shapeID", shape->Shape_ID },
                { "type", shape->getName() }
            });
        }
    }

    // TODO: move json to a separate class
    return {
        { "ID", current->ID },
        { "name", current->name },
        { "model", current->model },
        { "material", current->material },
        { "shapes",  shapes },
        { "objects",  objects }
    };
}

json Scene::getTransformData() {
    vector<json> list;

    const auto getObjectTransformData = [&list](const shared_ptr<GameObject>& gameObject) {
        const auto transform = gameObject->transform;

        const auto collider = gameObject->components.getOptional<Collider>();

        vector<json> shapeTransforms;

        if(collider) {
            for(const auto& shape: collider->shapes()) {
                shapeTransforms.push_back({
                    {"shapeID", shape->Shape_ID },
                    {"position", {
                        shape->getWorldPosition().x(),
                        shape->getWorldPosition().y(),
                        shape->getWorldPosition().z()
                    }},
                    {"rotation", {
                        shape->getWorldRotation().x(),
                        shape->getWorldRotation().y(),
                        shape->getWorldRotation().z(),
                        shape->getWorldRotation().w()
                    }},
                    {"scale", {
                        shape->getWorldScaling().x(),
                        shape->getWorldScaling().y(),
                        shape->getWorldScaling().z()
                    }}
                });
            }
        }

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
            }},
            { "shapeTransforms", shapeTransforms }
        });
    };

    tree.traverse(getObjectTransformData);

    return list;
}

void Scene::tick(float dt) {
    physicsWorld->dynamicsWorld->stepSimulation(dt);
}
