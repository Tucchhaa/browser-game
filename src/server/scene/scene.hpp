#pragma once

#include <vector>
#include <nlohmann/json.hpp>

#include "physics_world.hpp"
#include "tree.hpp"

using json = nlohmann::json;

class SceneSerializer;

struct PlayerInput {
    struct Mouse {
        bool leftButton;
        bool rightButton;
    };

    struct Keyboard {
        bool forward;
        bool backward;
        bool left;
        bool right;
        bool jump;
    };

    Keyboard keyboard{ false, false, false, false, false };
    Mouse mouse{ false, false };
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

    void addUser(Player* player) { players.push_back(player); }
    void removeUser(Player* player) {
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
    virtual void processUserInput(Player*) {};
};

class SceneSerializer {
public:
    static json getSceneData(const shared_ptr<Scene>& scene, const shared_ptr<GameObject>& gameObject = nullptr);

    static json getTransformData(const shared_ptr<Scene>& scene);
};