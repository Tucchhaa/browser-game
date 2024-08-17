#pragma once

#include <vector>
#include <nlohmann/json.hpp>

#include "physics_world.hpp"

class Scene {
public:
    std::vector<nlohmann::json> getObjectsList();

private:
    PhysicsWorld world;
};
