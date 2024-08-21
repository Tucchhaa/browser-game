#pragma once

#include <vector>
#include <nlohmann/json.hpp>

#include "physics_world.hpp"
#include "tree.hpp"

using json = nlohmann::json;

class Scene {
public:
    string name;

    vector<json> getObjectsList();

    json getTransformData();

    Scene();

    void tick(float dt);

protected:
    Tree tree;

    PhysicsWorld world;
};
