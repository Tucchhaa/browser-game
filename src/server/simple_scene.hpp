#pragma once

#include "scene/scene.hpp"
#include "scene/components/collider.hpp"

class SimpleScene: public Scene {
public:
    SimpleScene();

    void init();

    void tick(float dt) override;

protected:
    static constexpr float PlayerLinearSpeedFactor = 2.0f;

    shared_ptr<GameObject> addPlayerObject(Player*) override;

    void removePlayerObject(Player* player) override;

    void processPlayerInput(Player* user) override;

private:
    vector<shared_ptr<Collider>> colliders;

    vector<shared_ptr<GameObject>> playerObjects;
};
