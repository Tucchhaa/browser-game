#include "scene.hpp"

using json = nlohmann::json;

std::vector<nlohmann::json> Scene::getObjectsList() {
    json car;
    car["name"] = "car";
    car["model"] = "car/car.obj";
    car["material"] = "car/car.mtl";

    json ground;
    ground["name"] = "ground";
    ground["model"] = "plane.obj";
    ground["material"] = "plane.mtl";

    return { car, ground };
}