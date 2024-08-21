#include <iostream>
#include <unordered_set>
#include <mutex>

#include "nlohmann/json.hpp"
#include "crow.h"
#include "scene/scene.hpp"

class SimpleScene: public Scene {
public:
    SimpleScene(): Scene() {
        init();
    }

    void init() {
        auto car = tree.spawnGameObject();
        car->name = "car";
        car->model = "car/car.obj";
        car->material = "car/car.mtl";

        auto ground = tree.spawnGameObject();
        ground->name = "ground";
        ground->model = "plane.obj";
        ground->material = "plane.mtl";
    }
};

class Room {
    using user_t = crow::websocket::connection;
public:
    int ID;

    Scene scene;

    Room(): ID(generateID()), scene(Scene()) {
        scene = SimpleScene();
    }

    void addUser(user_t& user) {
        std::lock_guard _(mtx);
        users.insert(&user);
    }

    void removeUser(user_t& user) {
        std::lock_guard _(mtx);
        users.erase(&user);
    }

    void send(const std::string& text) {
        std::lock_guard _(mtx);

        for(auto* user : users) {
            user->send_text(text);
        }
    }

private:
    std::mutex mtx;
    std::unordered_set<user_t*> users;

    static int generateID() {
        static int count = 0;
        return count++;
    }
};

int main() {
    crow::SimpleApp app;

    std::unordered_set<crow::websocket::connection*> users;
    std::unordered_set<Room*> rooms;

    const auto mainRoom = new Room();

    rooms.insert(mainRoom);

    CROW_ROUTE(app, "/")([]() {
       return "Hello World";
    });

    CROW_ROUTE(app, "/json")([&]() {
        nlohmann::json response;
        response["type"] = "requestSceneData";
        response["sceneName"] = "scene1";
        response["data"] = mainRoom->scene.getObjectsList();

        return response.dump();
    });

    CROW_WEBSOCKET_ROUTE(app, "/ws")
        .onopen([&](crow::websocket::connection& connection) {
            CROW_LOG_INFO << "new websocket connection from " << connection.get_remote_ip();

            mainRoom->addUser(connection);

            connection.send_text(R"({ "info": "aboba" })");
        })
        .onclose([&](crow::websocket::connection& connection, const std::string& reason) {
            CROW_LOG_INFO << "websocket connection closed: " << reason;

            mainRoom->removeUser(connection);
        })
        .onmessage([&](crow::websocket::connection& conn, const std::string& data, bool is_binary) {
            nlohmann::json message = nlohmann::json::parse(data);
            const std::string type = message["type"];

            CROW_LOG_INFO << "received message type: " << type;

            if (type == "requestSceneData") {
                nlohmann::json response;
                response["type"] = "requestSceneData";
                response["sceneName"] = "scene1";
                response["data"] = mainRoom->scene.getObjectsList();

                conn.send_text(response.dump());
            }
            else {
                conn.send_text(R"({ "info": "message" })");
            }
        });

    app.port(8081).multithreaded().run();

    return 0;
}
