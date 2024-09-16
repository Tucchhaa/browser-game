#pragma once

#include <vector>
#include <nlohmann/json.hpp>

#include "physics_world.hpp"
#include "tree.hpp"

using json = nlohmann::json;

class SceneSerializer;

struct PlayerInput {
    int deltaX;
    int deltaZ;
    int deltaScreenX;
    int deltaScreenY;
    bool shift;
    bool mouseLeftButton;
    bool mouseRightButton;
};

class Player {
public:
    int ID;
    PlayerInput input;

    shared_ptr<GameObject> object;

    Player(): ID(generateID()) {}

private:
    static int generateID() {
        static int count = 0;
        return count++;
    }
};

class Scene {
friend SceneSerializer;
public:
    virtual ~Scene() = default;

    string name;

    Scene();

    virtual void tick(float dt);

    void addPlayer(Player* player) {
        players.push_back(player);
    }
    void removePlayer(Player* player) {
        removePlayerObject(player);

        const auto userIndex = find(players.begin(), players.end(), player);
        players.erase(userIndex);
    }

protected:
    Tree tree;

    shared_ptr<PhysicsWorld> physicsWorld;

    vector<Player*> players;

    /**
     * Called when user joined the room and need to create a game object for him
     */
    virtual shared_ptr<GameObject> addPlayerObject(Player*) = 0;

    virtual void removePlayerObject(Player*) = 0;

    /**
     * Called every frame to update user's game object according to user's input
     */
    virtual void processPlayerInput(Player*) {};
};

class SceneSerializer {
public:
    static json getSceneData(const shared_ptr<Scene>& scene, const shared_ptr<GameObject>& gameObject = nullptr);

    static json getTransformData(const shared_ptr<Scene>& scene);
};