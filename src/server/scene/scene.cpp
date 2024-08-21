#include "scene.hpp"

using json = nlohmann::json;

std::vector<nlohmann::json> Scene::getObjectsList() {
    vector<json> list;

    auto prepareObjectJSON = [&list](const shared_ptr<GameObject>& gameObject) {
        json object;
        object["name"] = gameObject->name;
        object["model"] = gameObject->model;
        object["material"] = gameObject->material;

        list.push_back(object);
    };

    tree.traverse(prepareObjectJSON);

    return list;
}

void Scene::tick() {
}
