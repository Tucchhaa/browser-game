#include <iostream>
#include <unordered_set>
#include <mutex>

#include "nlohmann/json.hpp"
#include "crow.h"
#include "room.hpp"
#include "scene/scene.hpp"

int main() {
    crow::SimpleApp app;

    unordered_set<crow::websocket::connection*> users;
    unordered_set<Room*> rooms;

    const auto mainRoom = new Room();

    rooms.insert(mainRoom);

    CROW_ROUTE(app, "/")([]() {
       return "Hello World";
    });

    CROW_ROUTE(app, "/json")([&]() {
        nlohmann::json response;
        response["type"] = "requestSceneData";
        response["sceneName"] = "scene1";
        response["data"] = SceneSerializer::getSceneData(mainRoom->scene);

        return response.dump();
    });

    CROW_WEBSOCKET_ROUTE(app, "/ws")
        .onopen([&](crow::websocket::connection& connection) {
            CROW_LOG_INFO << "new websocket connection from " << connection.get_remote_ip();

            mainRoom->addUser(connection);
        })
        .onclose([&](crow::websocket::connection& connection, const string& reason) {
            CROW_LOG_INFO << "websocket connection closed: " << reason;

            mainRoom->removeUser(connection);
        })
        .onmessage([&](crow::websocket::connection& connection, const string& data, bool is_binary) {
            json message = json::parse(data);
            const string type = message["type"];

            if (type == "sceneData") {
                connection.send_text(mainRoom->getSceneData(message).dump());
            }
            else if (type == "playerData") {
                connection.send_text(mainRoom->getPlayerData(connection).dump());
            }
            else if (type == "sync") {
                connection.send_text(mainRoom->getSyncData(connection, message).dump());
            }
        });

    mainRoom->start();
    app.port(8081).multithreaded().run();

    return 0;
}
