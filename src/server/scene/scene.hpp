#pragma once

#include <vector>
#include <nlohmann/json.hpp>

#include "physics_world.hpp"
#include "tree.hpp"

class Scene {
public:

    std::vector<nlohmann::json> getObjectsList();

    void tick();

protected:
    Tree tree;

    PhysicsWorld world;
};
