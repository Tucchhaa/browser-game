#include "room.hpp"

void Room::addUser(user_t& user) {
    lock_guard _(users_mtx);

    const auto player = new Player();

    users.insert(&user);
    user.userdata(player);
    scene->addPlayer(player);
}

void Room::removeUser(user_t& user) {
    lock_guard _(users_mtx);

    const auto player = getPlayer(user);

    users.erase(&user);
    scene->removePlayer(player);
}

Player* Room::getPlayer(user_t& user) {
    return static_cast<Player*>(user.userdata());
}

void Room::send(const string& text) {
    lock_guard _(users_mtx);

    for(auto* user : users) {
        user->send_text(text);
    }
}

nlohmann::json Room::getSceneData(nlohmann::json message) const {
    return {
        { "type", "sceneData" },
        { "sceneName", scene->name },
        { "root", SceneSerializer::getSceneData(scene) }
    };
}

nlohmann::json Room::getPlayerData(user_t& user) const {
    auto player = getPlayer(user);

    if(player->object == nullptr) {
        return {
            { "type", "playerData" },
            { "status", "not ready" }
        };
    }

    return {
        { "type", "playerData" },
        { "status", "ready" },
        { "gameObjectID", player->object->ID }
    };
}

nlohmann::json Room::getSyncData(user_t& user, nlohmann::json message) const {
    auto player = getPlayer(user);
    auto input = message["input"];

    player->input.deltaX = input["deltaX"];
    player->input.deltaZ = input["deltaZ"];
    player->input.shift = input["shift"];

    player->input.mouseLeftButton = input["mouseLeftButton"];
    player->input.mouseRightButton = input["mouseRightButton"];
    player->input.deltaScreenX = input["deltaMouseX"];
    player->input.deltaScreenY = input["deltaMouseY"];

    return {
        { "type", "sync" },
        { "send_timestamp", message["send_timestamp"] },
        { "transform", SceneSerializer::getTransformData(scene) },
    };
}

void Room::start() const {
    thread([this]() {
        constexpr unsigned int ms = 16;

        while(true) {
            scene->tick(ms/1000.);

            this_thread::sleep_for(chrono::milliseconds(ms));
        }
    }).detach();
}
