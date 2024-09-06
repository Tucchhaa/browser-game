#pragma once

#include <vector>
#include <nlohmann/json.hpp>

#include "physics_world.hpp"
#include "tree.hpp"

using json = nlohmann::json;

class SceneSerializer;

class Scene {
friend SceneSerializer;

public:
    virtual ~Scene() = default;

    string name;

    Scene();

    virtual void tick(float dt);

protected:
    Tree tree;

    shared_ptr<PhysicsWorld> physicsWorld;
};

class SceneSerializer {
public:
    static json getSceneData(const shared_ptr<Scene>& scene, const shared_ptr<GameObject>& gameObject = nullptr);

    static json getTransformData(const shared_ptr<Scene>& scene);
};