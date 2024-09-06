#include "scene.hpp"

#include <crow/logging.h>

#include "components/collider.hpp"

Scene::Scene() {
    name = "noname scene";

    physicsWorld = make_shared<PhysicsWorld>();
}

void Scene::tick(float dt) {
    physicsWorld->dynamicsWorld->stepSimulation(dt);
}

// ===
// Scene serializer
// ===

json SceneSerializer::getSceneData(const shared_ptr<Scene>& scene, const shared_ptr<GameObject>& gameObject) {
    auto current = gameObject == nullptr ? scene->tree.root : gameObject;

    vector<json> children;

    for(const auto& child: current->children) {
        children.push_back(getSceneData(scene, child));
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

    return {
        { "ID", current->ID },
        { "name", current->name },
        { "model", current->model },
        { "material", current->material },
        { "shapes",  shapes },
        { "children",  children }
    };
}

json SceneSerializer::getTransformData(const shared_ptr<Scene>& scene) {
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

    scene->tree.traverse(getObjectTransformData);

    return list;
}
