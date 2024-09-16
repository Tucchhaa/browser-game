#pragma once

#include <unordered_set>
#include <crow/websocket.h>
#include <nlohmann/json.hpp>

#include "simple_scene.hpp"
#include "scene/scene.hpp"

using namespace std;

class Room {
    using user_t = crow::websocket::connection;
public:
    int ID;

    shared_ptr<Scene> scene;

    Room() {
        ID = generateID();
        scene = make_shared<SimpleScene>();
    }

    void addUser(user_t& user);

    void removeUser(user_t& user);

    void send(const string& text);

    nlohmann::json getSceneData(nlohmann::json message) const;

    nlohmann::json getPlayerData(user_t& user) const;

    nlohmann::json getSyncData(user_t& user, nlohmann::json message) const;

    void start() const;

private:
    mutex users_mtx;

    unordered_set<user_t*> users;

    thread sceneThread;

    static Player* getPlayer(user_t& user);

    static int generateID() {
        static int count = 0;
        return count++;
    }
};
