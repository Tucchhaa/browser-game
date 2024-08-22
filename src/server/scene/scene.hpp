#pragma once

#include <vector>
#include <nlohmann/json.hpp>

#include "physics_world.hpp"
#include "tree.hpp"

using json = nlohmann::json;

class Scene {
public:
    virtual ~Scene() = default;

    string name;

    vector<json> getObjectsList();

    json getTransformData();

    Scene();

    virtual void tick(float dt);

protected:
    Tree tree;

    shared_ptr<PhysicsWorld> physicsWorld;
};
